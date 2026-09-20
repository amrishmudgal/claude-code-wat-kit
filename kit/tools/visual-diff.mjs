#!/usr/bin/env node
// Screenshots the running app in a real browser and compares it, pixel by pixel, with the approved design.
// The agent reads the numbers this prints. It opens a diff image only when a screen fails.
//
//   node tools/visual-diff.mjs                 compare every screen in design/visual.json
//   node tools/visual-diff.mjs --only login    one screen
//   node tools/visual-diff.mjs --approve       save current app screenshots as the regression baseline (after a screen passes)
//   node tools/visual-diff.mjs --compare a.png b.png    compare two images directly
//
// Two checks per screen and viewport:
//   design      app vs the approved reference (an .html mockup rendered in the same browser, or a .png)  -> threshold "design"
//   regression  app vs its own approved baseline in design/baselines/                                    -> threshold "regression"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

let PNG, pixelmatch;
try {
  ({ PNG } = await import("pngjs"));
  pixelmatch = (await import("pixelmatch")).default;
} catch {
  console.error("visual-diff: dependencies missing. Run: npm --prefix tools install && npx --prefix tools playwright install chromium");
  process.exit(3);
}

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const val = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const OUT = ".tmp/visual";
mkdirSync(OUT, { recursive: true });

// Compares two PNG buffers. Different sizes are compared over the shared area and the size gap is reported.
export function compare(bufA, bufB, diffPath) {
  const a = PNG.sync.read(bufA), b = PNG.sync.read(bufB);
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  const crop = (img) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(img, o, 0, 0, w, h, 0, 0); return o; };
  const ca = crop(a), cb = crop(b), diff = new PNG({ width: w, height: h });
  const bad = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1, includeAA: false });
  if (diffPath) writeFileSync(diffPath, PNG.sync.write(diff));
  return { mismatch: bad / (w * h), sizeA: `${a.width}x${a.height}`, sizeB: `${b.width}x${b.height}`, heightGap: Math.abs(a.height - b.height) };
}

if (flag("--compare")) {
  const [fa, fb] = args.slice(args.indexOf("--compare") + 1);
  const r = compare(readFileSync(fa), readFileSync(fb), `${OUT}/compare-diff.png`);
  console.log(JSON.stringify({ ...r, mismatchPct: +(r.mismatch * 100).toFixed(3), diff: `${OUT}/compare-diff.png` }));
  process.exit(0);
}

const cfgPath = "design/visual.json";
if (!existsSync(cfgPath)) { console.error(`visual-diff: ${cfgPath} not found. It is created in workflows/03_design-first.md.`); process.exit(1); }
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
const limits = { design: 0.03, regression: 0.002, ...(cfg.thresholds ?? {}) };
const screens = (cfg.screens ?? []).filter((s) => !val("--only") || s.name === val("--only"));
if (!screens.length) { console.error("visual-diff: no screens to check."); process.exit(1); }

let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("visual-diff: playwright missing. Run: npm --prefix tools install && npx --prefix tools playwright install chromium"); process.exit(3); }
const browser = await chromium.launch();
const rows = [];
let failed = 0;

const shoot = async (url, width, screen) => {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce",
    ...(screen.storageState && existsSync(screen.storageState) ? { storageState: screen.storageState } : {}),
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  if (screen.waitFor) await page.waitForSelector(screen.waitFor, { timeout: 15000 });
  await page.evaluate(() => document.fonts?.ready);
  const buf = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide", mask: (screen.mask ?? []).map((s) => page.locator(s)) });
  await ctx.close();
  return { buf, errors };
};

for (const s of screens) {
  for (const width of s.viewports ?? cfg.viewports ?? [375, 1440]) {
    const tag = `${s.name}-${width}`;
    try {
      const app = await shoot(new URL(s.path, cfg.baseUrl).href, width, s);
      writeFileSync(`${OUT}/${tag}-app.png`, app.buf);
      const row = { screen: tag, consoleErrors: app.errors.length };

      if (s.reference) {
        const ref = s.reference.endsWith(".html")
          ? (await shoot(pathToFileURL(resolve(s.reference)).href, width, { mask: s.mask })).buf
          : readFileSync(s.reference.replace("{width}", width));
        const r = compare(ref, app.buf, `${OUT}/${tag}-design-diff.png`);
        row.design = `${(r.mismatch * 100).toFixed(2)}%`;
        row.heightGap = r.heightGap;
        row.designOk = r.mismatch <= limits.design && r.heightGap <= (cfg.maxHeightGap ?? 40);
      }

      const basePath = `design/baselines/${tag}.png`;
      if (flag("--approve")) { mkdirSync("design/baselines", { recursive: true }); writeFileSync(basePath, app.buf); row.regression = "baseline saved"; }
      else if (existsSync(basePath)) {
        const r = compare(readFileSync(basePath), app.buf, `${OUT}/${tag}-regression-diff.png`);
        row.regression = `${(r.mismatch * 100).toFixed(2)}%`;
        row.regressionOk = r.mismatch <= limits.regression;
      }
      if (row.designOk === false || row.regressionOk === false || app.errors.length) failed++;
      if (app.errors.length) row.firstError = app.errors[0];
      rows.push(row);
    } catch (e) { failed++; rows.push({ screen: tag, error: String(e.message ?? e).slice(0, 200) }); }
  }
}
await browser.close();
console.table(rows);
console.log(`limits: design <= ${limits.design * 100}% , regression <= ${limits.regression * 100}% . Images and diffs: ${OUT}/`);
console.log(failed ? `visual-diff: ${failed} screen(s) need work. Open the *-diff.png for each, fix, run again.` : "visual-diff: all screens pass.");
process.exit(failed ? 1 : 0);
