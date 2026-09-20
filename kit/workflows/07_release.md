# 07 Release

**Path:** local → preview → production. You do all of it. Production is never the first place something is tested.

## Preview (end of every phase)
0. Dependency updates: `gh pr list --author "app/dependabot"`. Merge the ones with green CI first (security fixes always), so the release is tested on current dependencies. A red one becomes a task, not a blocker.
1. `node tools/check.mjs` (full: build and e2e).
2. `node tools/visual-diff.mjs` for every screen. All pass.
3. `/review`: reviewer subagent, plus security-auditor when the phase touches auth, user data, payments, uploads, webhooks or AI. Fix blockers one at a time.
4. Env: `node tools/env-check.mjs`, then `node tools/env-check.mjs .env.production.local`. Send values to the host with `node tools/env-push.mjs --file .env.production.local --target production,preview`. A variable that exists locally but not on the host is the most common cause of "works locally, broken live".
5. Cloud database: apply this phase's migrations to the cloud project with the stack's migration command. They were already applied and tested locally. Additive changes go before the code is merged. Destructive changes follow the two-release rule in `CLAUDE.md`, with a backup first once real users exist.
6. Push the branch. Open a PR: what a user can now do, migrations included, new env vars, known issues, visual-diff numbers.
7. Wait for CI and the preview deployment (`gh pr checks --watch`). If CI fails, fix it. Never bypass it.
8. Open the preview URL with chrome-devtools. Run the critical flows from `brain/08_TEST_PLAN.md` at 375 and 1440. Console and network clean.

## Production
9. Merge: `gh pr merge --squash --delete-branch`. Then `git checkout main && git pull`.
10. Wait for the production deploy. Run the production smoke test from `brain/08_TEST_PLAN.md` on the live URL with chrome-devtools. Leave no test data behind.
   Background or scheduled jobs in this release: confirm each schedule is registered on the platform, fire one manual run, and read its log to the end.
11. If the smoke test fails: roll back first (`brain/09_RUNBOOK.md`), debug second with `workflows/05_debug.md`. Report it honestly.
12. Tick the phase in `brain/04_PLAN.md`. `node tools/notify-slack.mjs "Released: <phase>. <live url>"`.
13. Report to the owner: what users can now do, the live link, the PR link and CI result, migrations applied, env vars added (names only), what the smoke test covered, two or three things worth trying, anything you need from them for the next phase. Then `/handoff`. Next session: `/plan-phase`.

## Launch (last phase only)
Custom domain and DNS, email sending domain verified, error tracking live, alerts reaching Slack, backups on and one restore tried, rollback tried once, spend alerts on every paid service (owner, in their dashboards, with your steps), a way for users to reach the owner.
