#!/usr/bin/env node
// PreToolUse hook for Bash. Exit 2 = block (stderr goes back to Claude). Anything unexpected = allow.
import { execSync } from "node:child_process";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let cmd = "";
try { cmd = JSON.parse(raw)?.tool_input?.command ?? ""; } catch { process.exit(0); }
if (!cmd) process.exit(0);

const block = (why) => { console.error(`BLOCKED by tools/guard.mjs: ${why}`); process.exit(2); };

if (/\bgit\s+push\b/.test(cmd)) {
  if (/(--force\b|--force-with-lease|\s-f\b)/.test(cmd)) block("force push is never allowed.");
  // Destination decides. Explicit refspecs win; with none, the current branch is what gets pushed.
  const args = (cmd.match(/\bgit\s+push\b([^|;&]*)/)?.[1] ?? "").trim().split(/\s+/).filter((a) => a && !a.startsWith("-"));
  const refspecs = args.slice(1); // args[0] is the remote
  const toMain = (r) => /^(main|master)$/.test(r.includes(":") ? r.split(":").pop() : r) || /^HEAD$/.test(r) && onMain();
  function onMain() { try { return /^(main|master)$/.test(execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim()); } catch { return false; } }
  if (refspecs.length ? refspecs.some(toMain) : onMain()) block("no pushing straight to main. Push the phase branch, open a PR, wait for CI, verify the preview, then merge it yourself with gh pr merge.");
}
if (/(>>?|\btee\b|\bsed\s+-i|\brm\b|\bmv\b|\bcp\b|\btruncate\b)[^|;&]*(?<![\w.-]\/)(?<!\.github\/)\bworkflows\//.test(cmd) && !/\.github\/workflows\//.test(cmd)) block("workflow files are standing instructions. Record the proposed change in brain/05_STATE.md under 'Proposed workflow changes', show it to the owner, and after a yes make it with the Edit tool.");
if (/--no-verify\b/.test(cmd)) block("do not skip git hooks.");
if (/\bgh\s+pr\s+merge\b/.test(cmd) && /--admin\b/.test(cmd)) block("do not bypass CI with --admin. Fix the failing check.");
if (/\bvercel\b.*--prod\b/.test(cmd)) block("production deploys happen by merging the PR, so CI and the preview check always run first. Use gh pr merge. To undo a bad release use vercel rollback.");
if (/\bsupabase\s+db\s+reset\b.*--linked/.test(cmd)) block("never reset a linked (cloud) database.");
if (/\brm\s+-[a-zA-Z]*r[a-zA-Z]*\s+(\/|~|\$HOME)(\s|\/?\*|$)/.test(cmd)) block("refusing to delete the root or home directory.");
if (/^\s*(printenv|env)\s*$/.test(cmd)) block("do not dump the environment. Use: node tools/env-check.mjs");
if (/\b(cat|less|more|head|tail|bat|type|Get-Content|gc|grep|rg|sed|awk|cp|scp)\b[^|;&]*\.env(?!\.example)(\.[\w.]+)?\b/.test(cmd)) block("do not read env files. Use: node tools/env-check.mjs (names and status only).");
process.exit(0);
