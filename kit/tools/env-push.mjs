#!/usr/bin/env node
// Copies variable VALUES from a local env file to the hosting provider without the agent ever seeing them.
// Prints names and results only.
//   node tools/env-push.mjs --file .env.production.local --target production,preview [--dry-run]
// Supports Vercel (needs `vercel login` and `vercel link` done once). Other hosts: extend the push() function.
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const val = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d);
const file = val("--file", ".env.production.local");
const targets = val("--target", "production,preview").split(",").map((t) => t.trim()).filter(Boolean);
const dry = args.includes("--dry-run");

if (!existsSync(file)) { console.error(`env-push: ${file} not found. The owner fills it in from .env.example; see workflows/08_add-service.md.`); process.exit(1); }
const vars = [];
for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!m) continue;
  const value = m[2].replace(/\s+#.*$/, "").trim().replace(/^(["'])(.*)\1$/, "$2");
  if (value) vars.push([m[1], value]);
}
if (!vars.length) { console.error(`env-push: no filled-in variables in ${file}.`); process.exit(1); }

const push = (name, value, target) => {
  spawnSync("vercel", ["env", "rm", name, target, "--yes"], { stdio: "ignore", shell: process.platform === "win32" });
  const r = spawnSync("vercel", ["env", "add", name, target], { input: value, stdio: ["pipe", "ignore", "pipe"], shell: process.platform === "win32" });
  return r.status === 0 ? "ok" : `FAILED (${String(r.stderr ?? "").replace(value, "***").split("\n")[0].slice(0, 120)})`;
};

let failures = 0;
const rows = [];
for (const [name, value] of vars) for (const target of targets) {
  const result = dry ? "would set" : push(name, value, target);
  if (result.startsWith("FAILED")) failures++;
  rows.push({ name, target, result });
}
console.table(rows);
console.log(dry ? "dry run: nothing sent." : "Redeploy for new values to take effect.");
process.exit(failures ? 1 : 0);
