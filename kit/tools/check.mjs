#!/usr/bin/env node
// The single quality gate. Runs secret-scan, then each command in tools/checks.json, stopping at the first failure.
// Usage: node tools/check.mjs [--fast]   (--fast skips "build" and "e2e")
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const fast = process.argv.includes("--fast");
const checks = JSON.parse(readFileSync(new URL("./checks.json", import.meta.url), "utf8"));
const order = ["format", "lint", "typecheck", "test", "build", "e2e"].filter((k) => !(fast && (k === "build" || k === "e2e")));

const run = (label, cmd) => {
  console.log(`\n--- ${label}: ${cmd}`);
  const r = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (r.status !== 0) { console.error(`\nFAILED at "${label}". Fix this before anything else.`); process.exit(r.status ?? 1); }
};

run("secret-scan", "node tools/secret-scan.mjs");
let ran = 0;
for (const key of order) if (checks[key]) { run(key, checks[key]); ran++; }
if (!ran) console.log("\nNo stack checks configured yet. Fill tools/checks.json after the stack is chosen.");
console.log("\nAll checks passed.");
