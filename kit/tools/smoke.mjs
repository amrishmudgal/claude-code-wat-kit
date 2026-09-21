#!/usr/bin/env node
// Production smoke test. The same checks, the same way, after every release. The exit code decides rollback, not an opinion.
//
//   node tools/smoke.mjs --url https://app.example.com          run every check in tools/smoke.json against that base URL
//   node tools/smoke.mjs --url http://localhost:3000 --only home
//
// Exit 0 = all passed. Exit 1 = at least one failed (roll back first, debug second). Exit 3 = config or dependency problem.
// Checks are read-only by design: GET requests and page loads. Nothing here may create data on production.
//
// A check in tools/smoke.json:
//   { "name": "home", "path": "/", "status": 200, "contains": "Sign in" }                       plain HTTP, no browser needed
//   { "name": "private redirects", "path": "/dashboard", "status": [302, 307, 401], "redirect": "manual" }
//   { "name": "health", "path": "/api/health", "status": 200, "json": { "ok": true }, "maxMs": 1500 }
//   { "name": "login renders", "path": "/login", "selector": "form button[type=submit]", "noConsoleErrors": true }   needs Playwright
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const base = (opt("--url") ?? "").replace(/\/+$/, "");
const only = opt("--only");
const file = opt("--config") ?? "tools/smoke.json";
if (!/^https?:\/\//.test(base)) { console.error("smoke: pass the base URL, for example --url https://app.example.com"); process.exit(3); }
if (!existsSync(file)) { console.error(`smoke: ${file} not found. It is filled in by workflows/02_stack-selection.md and extended by every phase.`); process.exit(3); }

let checks;
try { checks = JSON.parse(readFileSync(file, "utf8")).checks ?? []; } catch (e) { console.error(`smoke: ${file} is not valid JSON: ${e.message}`); process.exit(3); }
if (only) checks = checks.filter((c) => c.name === only);
if (!checks.length) { console.error("smoke: no checks to run. An empty smoke test proves nothing, so this counts as a failure."); process.exit(1); }

const subset = (want, got) => Object.entries(want).every(([k, v]) => (v && typeof v === "object" ? got?.[k] && subset(v, got[k]) : got?.[k] === v));
let browser;
const rows = [];
for (const c of checks) {
  const url = base + c.path, started = Date.now(), problems = [];
  try {
    if (c.selector || c.noConsoleErrors) {
      if (!browser) {
        let chromium;
        try { ({ chromium } = await import("playwright")); } catch { console.error("smoke: this check needs a browser. Run: npm --prefix tools install && npx --prefix tools playwright install chromium"); process.exit(3); }
        browser = await chromium.launch();
      }
      const page = await browser.newPage(), errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 120)));
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
      const res = await page.goto(url, { waitUntil: "networkidle", timeout: c.maxMs ?? 20000 });
      const want = [c.status ?? 200].flat();
      if (!want.includes(res?.status())) problems.push(`status ${res?.status()}, wanted ${want.join("/")}`);
      if (c.selector && !(await page.locator(c.selector).first().isVisible().catch(() => false))) problems.push(`selector not visible: ${c.selector}`);
      if (c.contains && !(await page.content()).includes(c.contains)) problems.push(`text missing: "${c.contains}"`);
      if (c.noConsoleErrors && errors.length) problems.push(`${errors.length} console error(s): ${errors[0]}`);
      await page.close();
    } else {
      const res = await fetch(url, { redirect: c.redirect ?? "follow", signal: AbortSignal.timeout(c.maxMs ?? 20000), headers: { "user-agent": "wat-kit-smoke" } });
      const want = [c.status ?? 200].flat();
      if (!want.includes(res.status)) problems.push(`status ${res.status}, wanted ${want.join("/")}`);
      const body = c.contains || c.json ? await res.text() : "";
      if (c.contains && !body.includes(c.contains)) problems.push(`text missing: "${c.contains}"`);
      if (c.json) { let j; try { j = JSON.parse(body); } catch { problems.push("response is not JSON"); } if (j && !subset(c.json, j)) problems.push(`json does not contain ${JSON.stringify(c.json)}`); }
    }
  } catch (e) { problems.push(e.name === "TimeoutError" ? `timed out after ${c.maxMs ?? 20000} ms` : String(e.message ?? e).slice(0, 140)); }
  const ms = Date.now() - started;
  if (c.maxMs && ms > c.maxMs && !problems.length) problems.push(`took ${ms} ms, budget ${c.maxMs} ms`);
  rows.push({ name: c.name, ms, problems });
}
if (browser) await browser.close();

for (const r of rows) console.log(`${r.problems.length ? "FAIL" : "ok  "}  ${r.name.padEnd(28)} ${String(r.ms).padStart(6)} ms  ${r.problems.join("; ")}`);
const failed = rows.filter((r) => r.problems.length).length;
console.log(`smoke: ${rows.length - failed}/${rows.length} passed against ${base}`);
process.exit(failed ? 1 : 0);
