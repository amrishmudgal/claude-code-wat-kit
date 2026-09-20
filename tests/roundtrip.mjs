#!/usr/bin/env node
// Proves dist/CLAUDE.md installs exactly what is in kit/, the same way Claude Code does it:
// copy the Extractor block out of the file, run it in an empty folder, compare byte for byte.
// Also proves: dist is up to date with kit/, a Windows (CRLF) copy still works, a truncated file writes nothing.
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const fail = (m) => { console.error("FAIL: " + m); process.exit(1); };
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });

const fresh = join(mkdtempSync(join(tmpdir(), "wat-build-")), "CLAUDE.md");
execFileSync("node", [join(root, "scripts/build-bootstrap.mjs"), join(root, "kit"), fresh], { stdio: "ignore" });
const dist = readFileSync(join(root, "dist/CLAUDE.md"), "utf8");
if (dist !== readFileSync(fresh, "utf8")) fail("dist/CLAUDE.md is stale. Run: npm run build");

const install = (text) => {
  const dir = mkdtempSync(join(tmpdir(), "wat-install-"));
  writeFileSync(join(dir, "CLAUDE.md"), text);
  const block = text.replace(/\r\n/g, "\n").match(/## Extractor\n\n```js\n([\s\S]*?)\n```/);
  if (!block) fail("no Extractor block found");
  writeFileSync(join(dir, "extract.mjs"), block[1]);
  const r = spawnSync("node", ["extract.mjs"], { cwd: dir, encoding: "utf8" });
  return { dir, r };
};

const kitFiles = walk(join(root, "kit")).map((p) => relative(join(root, "kit"), p).split("\\").join("/")).sort();
for (const [label, text] of [["LF", dist], ["CRLF", dist.replace(/\n/g, "\r\n")]]) {
  const { dir, r } = install(text);
  if (r.status !== 0) fail(`${label}: extractor exited ${r.status}: ${r.stderr}`);
  for (const f of kitFiles) {
    if (!existsSync(join(dir, f))) fail(`${label}: missing ${f}`);
    const want = readFileSync(join(root, "kit", f), "utf8").replace(/\r\n/g, "\n").replace(/\n+$/, "");
    const got = readFileSync(join(dir, f), "utf8").replace(/\n+$/, "");
    if (want !== got) fail(`${label}: ${f} differs from kit/`);
  }
  const extra = walk(dir).map((p) => relative(dir, p).split("\\").join("/")).filter((f) => f !== "extract.mjs" && !kitFiles.includes(f));
  if (extra.length) fail(`${label}: unexpected files ${extra.join(", ")}`);
  console.log(`ok  ${label}: ${kitFiles.length} files installed, identical to kit/`);
}

const { dir, r } = install(dist.slice(0, Math.floor(dist.length * 0.6)) + "\n~~~~~~~~~~\n");
if (r.status === 0) fail("truncated installer should have failed");
if (existsSync(join(dir, "brain"))) fail("truncated installer wrote files");
console.log("ok  truncated file: refused, nothing written");
