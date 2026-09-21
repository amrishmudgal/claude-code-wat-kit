#!/usr/bin/env node
// Runs kit/tools/smoke.mjs against a throwaway local server. HTTP checks only, so no browser is needed in CI.
import { createServer } from "node:http";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const smoke = fileURLToPath(new URL("../kit/tools/smoke.mjs", import.meta.url));

const server = createServer((req, res) => {
  if (req.url === "/") return res.writeHead(200, { "content-type": "text/html" }).end("<h1>Sign in</h1>");
  if (req.url === "/api/health") return res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ ok: true, db: { up: true }, version: "1" }));
  if (req.url === "/dashboard") return res.writeHead(307, { location: "/login" }).end();
  res.writeHead(404).end("nope");
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;
const dir = mkdtempSync(join(tmpdir(), "wat-smoke-"));
// spawnSync would block this process, and the server lives in it, so run the tool asynchronously.
const { spawn } = await import("node:child_process");
const run = (checks, extra = []) => new Promise((resolve) => {
  const cfg = join(dir, `c${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(cfg, JSON.stringify({ checks }));
  const p = spawn("node", [smoke, "--url", base, "--config", cfg, ...extra]); let out = "";
  p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d));
  p.on("close", (code) => resolve({ code, out }));
});

const good = [
  { name: "home", path: "/", status: 200, contains: "Sign in" },
  { name: "health", path: "/api/health", json: { ok: true, db: { up: true } }, maxMs: 5000 },
  { name: "private redirects", path: "/dashboard", status: [302, 307, 401], redirect: "manual" },
];
const cases = [
  ["all good passes", good, 0],
  ["wrong status fails", [{ name: "x", path: "/missing", status: 200 }], 1],
  ["missing text fails", [{ name: "x", path: "/", contains: "Welcome back" }], 1],
  ["wrong json fails", [{ name: "x", path: "/api/health", json: { ok: false } }], 1],
  ["one bad check fails the run", [...good, { name: "bad", path: "/missing" }], 1],
  ["empty config is a failure, not a pass", [], 1],
];
let bad = 0;
for (const [label, checks, want] of cases) {
  const { code, out } = await run(checks);
  if (code !== want) { console.error(`FAIL: ${label}: exit ${code}, wanted ${want}\n${out}`); bad++; }
}
const noUrl = spawnSync("node", [smoke], { encoding: "utf8" });
if (noUrl.status !== 3) { console.error("FAIL: missing --url should exit 3"); bad++; }
server.close();
if (bad) process.exit(1);
console.log(`ok  smoke: ${cases.length + 1} cases`);
