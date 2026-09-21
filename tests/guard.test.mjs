#!/usr/bin/env node
// tools/guard.mjs is the last line of defence for an owner who does not read code. Every rule has a case here.
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const guard = fileURLToPath(new URL("../kit/tools/guard.mjs", import.meta.url));

// The push rule depends on the current branch, so tests run inside throwaway repos with a known branch.
const repoOn = (branch) => {
  const dir = mkdtempSync(join(tmpdir(), "wat-guard-"));
  const git = (...a) => spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...a], { cwd: dir });
  git("init", "-q", "-b", branch, "."); git("commit", "-q", "--allow-empty", "-m", "init");
  return dir;
};
const onPhase = repoOn("phase/4-foundation"), onMain = repoOn("main");
const run = (command, cwd = onPhase) => spawnSync("node", [guard], { cwd, input: JSON.stringify({ tool_input: { command } }), encoding: "utf8" }).status;

const BLOCK = [
  "git push --force", "git push -f origin feat/x", "git push origin main", "git push origin HEAD:main",
  "git commit --no-verify -m x", "gh pr merge 12 --admin --squash", "vercel --prod", "vercel deploy --prod",
  "supabase db reset --linked", "rm -rf /", "rm -rf ~", "rm -rf $HOME", "printenv", "env",
  "cat .env", "cat .env.local", "head -5 .env.production.local", "grep KEY .env.local", "cp .env.local /tmp/x",
  "echo x >> workflows/04_build-task.md", "sed -i s/a/b/ workflows/README.md", "rm workflows/05_debug.md",
  "cp draft.md workflows/11_import.md", "mv workflows/05_debug.md /tmp/", "tee workflows/x.md",
];
const ALLOW = [
  "git push -u origin phase/4-foundation", "git status", "gh pr create --fill", "gh pr merge 12 --squash --delete-branch",
  "vercel", "vercel rollback", "supabase db push", "supabase db reset", "cat .env.example", "node tools/env-check.mjs",
  "node tools/env-push.mjs --file .env.production.local --target production --dry-run", "rm -rf .tmp", "rm -rf node_modules",
  "cat workflows/README.md", "ls workflows/", "git add workflows/ && git commit -m 'docs(workflows): learned line'",
  "echo x > .github/workflows/ci.yml", "node extract.mjs", "npm --prefix tools install", "node tools/smoke.mjs --url https://app.example.com",
];
let bad = 0;
for (const c of ["git push", "git push origin", "git push -u origin HEAD"]) {
  if (run(c, onMain) !== 2) { console.error("on main, should BLOCK: " + c); bad++; }
  if (run(c, onPhase) !== 0) { console.error("on a phase branch, should ALLOW: " + c); bad++; }
}
if (run("git push -u origin phase/5-billing", onMain) !== 0) { console.error("on main, pushing a named phase branch should be ALLOWED"); bad++; }
for (const c of BLOCK) if (run(c) !== 2) { console.error("should BLOCK: " + c); bad++; }
for (const c of ALLOW) if (run(c) !== 0) { console.error("should ALLOW: " + c); bad++; }
// malformed input must never crash the hook into blocking everything
if (spawnSync("node", [guard], { input: "not json", encoding: "utf8" }).status !== 0) { console.error("malformed input should be allowed through"); bad++; }
if (bad) { console.error(`FAIL: ${bad} guard case(s)`); process.exit(1); }
console.log(`ok  guard: ${BLOCK.length} blocked, ${ALLOW.length} allowed`);
