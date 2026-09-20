#!/usr/bin/env node
// Compares .env.example (names) against an env file. Prints NAMES and status only, never values.
// Usage: node tools/env-check.mjs [envfile]   (default: .env.local)
import { readFileSync, existsSync } from "node:fs";

const target = process.argv[2] ?? ".env.local";
const parse = (path) => {
  const out = new Map();
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (m) out.set(m[1], { raw: m[2], optional: /#\s*optional/i.test(m[2]) });
  }
  return out;
};
const hasValue = (raw) => raw.replace(/#.*$/, "").trim().replace(/^["']|["']$/g, "").length > 0;

if (!existsSync(".env.example")) { console.error(".env.example not found"); process.exit(1); }
const wanted = parse(".env.example");
const have = parse(target);
if (!existsSync(target)) console.log(`${target} does not exist yet. Copy .env.example to ${target} and fill it in.`);

let problems = 0;
const rows = [];
for (const [name, meta] of wanted) {
  const set = have.has(name) && hasValue(have.get(name).raw);
  if (!set && !meta.optional) problems++;
  rows.push({ name, kind: meta.optional ? "optional" : "required", status: set ? "SET" : "MISSING" });
}
for (const name of have.keys()) if (!wanted.has(name)) rows.push({ name, kind: "undocumented", status: "add to .env.example" });
console.table(rows);

const publicPrefix = /^(NEXT_PUBLIC_|VITE_|PUBLIC_|EXPO_PUBLIC_|NUXT_PUBLIC_)/;
const sensitive = /(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN)/;
for (const name of new Set([...wanted.keys(), ...have.keys()])) {
  if (publicPrefix.test(name) && sensitive.test(name)) {
    console.error(`DANGER: ${name} has a browser-exposed prefix but looks like a secret. Rename it.`);
    problems++;
  }
}
process.exit(problems ? 1 : 0);
