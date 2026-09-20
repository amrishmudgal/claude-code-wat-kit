#!/usr/bin/env node
// Static checks on kit/: scripts parse, JSON parses, no secrets, CLAUDE.md stays short, files that docs point to exist.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
const kit = fileURLToPath(new URL("../kit", import.meta.url));
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
let bad = 0; const err = (m) => { console.error("FAIL: " + m); bad++; };
const files = walk(kit);
for (const f of files.filter((f) => f.endsWith(".mjs"))) if (spawnSync("node", ["--check", f]).status !== 0) err("syntax: " + relative(kit, f));
for (const f of files.filter((f) => f.endsWith(".json"))) try { JSON.parse(readFileSync(f, "utf8")); } catch { err("json: " + relative(kit, f)); }
const lines = readFileSync(join(kit, "CLAUDE.md"), "utf8").trimEnd().split("\n").length;
if (lines > 60) err(`kit/CLAUDE.md is ${lines} lines. It is loaded every session: keep it at 60 or under and move detail into workflows/.`);
for (const f of files.filter((f) => f.endsWith(".md"))) for (const m of readFileSync(f, "utf8").matchAll(/`((?:workflows|tools|brain)\/[\w./-]+\.(?:md|mjs|json))`/g)) if (!existsSync(join(kit, m[1]))) err(`${relative(kit, f)} points to missing ${m[1]}`);
const scan = spawnSync("node", [join(kit, "tools/secret-scan.mjs")], { cwd: fileURLToPath(new URL("..", import.meta.url)), encoding: "utf8" });
if (scan.status !== 0) err("secret-scan: " + (scan.stdout + scan.stderr).trim().split("\n").slice(-3).join(" | "));
if (bad) process.exit(1);
console.log(`ok  lint: ${files.length} files, CLAUDE.md ${lines} lines`);
