#!/usr/bin/env node
// Scans files git would commit for credential patterns and tracked env files. Prints location + pattern name, never the match.
import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const patterns = {
  "private key block": /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  "JWT / Supabase key": /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/,
  "Supabase access token": /sbp_[a-f0-9]{30,}/,
  "Supabase secret key": /sb_secret_[A-Za-z0-9_-]{20,}/,
  "Anthropic / OpenAI style key": /sk-[A-Za-z0-9_-]{24,}/,
  "Resend key": /\bre_[A-Za-z0-9_]{20,}/,
  "GitHub token": /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  "Slack token": /xox[abprs]-[A-Za-z0-9-]{10,}/,
  "Slack webhook": /hooks\.slack\.com\/services\/T[A-Za-z0-9]+\/B[A-Za-z0-9]+\/[A-Za-z0-9]+/,
  "AWS access key": /\bAKIA[0-9A-Z]{16}\b/,
  "Stripe live key": /\b[sr]k_live_[A-Za-z0-9]{20,}/,
  "Vercel token-like assignment": /VERCEL_TOKEN\s*=\s*["']?[A-Za-z0-9]{20,}/,
};
const skipExt = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|otf|mp4|mov|lock)$/i;
const skipFile = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|tools\/secret-scan\.mjs)$/;

let files = [];
try {
  files = execSync("git ls-files -co --exclude-standard", { stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n").filter(Boolean);
} catch { console.error("Not a git repository yet. Run: git init"); process.exit(1); }

let hits = 0;
for (const f of files) {
  if (/(^|\/)\.env(\.|$)/.test(f) && !/\.env\.example$/.test(f)) { console.error(`${f}: env file is not ignored by git. Fix .gitignore.`); hits++; continue; }
  if (skipExt.test(f) || skipFile.test(f)) continue;
  let text;
  try { if (statSync(f).size > 1_000_000) continue; text = readFileSync(f, "utf8"); } catch { continue; }
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [label, re] of Object.entries(patterns)) if (re.test(line)) { console.error(`${f}:${i + 1}: ${label}`); hits++; }
  });
}
console.log(hits ? `secret-scan: ${hits} problem(s). Remove them, rotate any real key, then re-run.` : `secret-scan: clean (${files.length} files)`);
process.exit(hits ? 1 : 0);
