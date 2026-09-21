# 04 Build a task

**Goal:** one task from the current phase file, finished, verified in a real browser, committed and pushed. No owner involvement.

1. Read the task and its acceptance criteria. Open only the files it names, plus the `brain/` sections that `00_INDEX.md` maps to it.
2. Look for something to reuse before writing anything new: a component, a helper, a query, and a script in `tools/README.md`. For boilerplate, use the stack's own generator or CLI (new migration, types from the schema, scaffolds) instead of writing it by hand.
   If the task uses an outside API or a library feature you have not already used in this repo, send the `researcher` subagent to confirm it exists and how it authenticates and rate-limits. Do not code against an API from memory.
3. State the plan in 8 lines or fewer. If it needs a new dependency, a schema change outside the task, or more than about 6 files, the task is too big: re-slice it in the phase file and continue with the first slice.
4. Be on the phase branch `phase/<N>-<name>`, never `main`.
5. Turn each acceptance criterion into an automated test first, including the task's must-fail case. It fails now; that is the point. This test, not your impression of the screen, is what proves the task.
6. Implement the smallest change that meets the criteria. Rules, calculations, permissions and state changes go in plain code and database constraints, never in a prompt. Follow `.claude/rules/`. Handle the two standing edge cases for anything that talks to the outside: nothing new came back, and the call failed.
7. Data change: create the migration with the database CLI, apply it to the local database, run the tests, note the rollback in the migration. Regenerate types from the schema with the project tool, do not hand-edit them.
8. New env var or service: `workflows/08_add-service.md`. If it needs a key from the owner, ask once with full steps, then continue with the next unblocked task.
9. Prove it, in this order. Each line is an exit code or a number:
   - the tests from step 5 now pass
   - `node tools/check.mjs --fast`
   - looks: `workflows/10_visual-qa.md` for every screen the task touched
   - then drive the running app once with chrome-devtools as a user would: console and network must be clean. This is for catching what no test looks for, not a substitute for one. Anything you find becomes a test.
10. New screen or endpoint that must be alive in production: add a read-only check to `tools/smoke.json`. New flow: add it to `brain/08_TEST_PLAN.md`.
11. Did any sequence by hand for the second time (resetting data, seeding, calling an admin API)? Write the tool, register it in `tools/README.md`.
12. Commit `feat|fix|chore(scope): what changed`, one task one commit, and push the branch.
13. Close the session with `/handoff` (you run its steps yourself; the owner never types it).

Something failed along the way: run the self-improvement loop in `workflows/README.md` and record the proposed workflow change in STATE before closing the task.

Blocked by something only the owner can give: write exactly what you need under "Waiting on the owner" in STATE, tell them once with steps, move to the next unblocked task.
