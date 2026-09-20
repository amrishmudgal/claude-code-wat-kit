# 04 Build a task

**Goal:** one task from the current phase file, finished, verified in a real browser, committed and pushed. No owner involvement.

1. Read the task and its acceptance criteria. Open only the files it names, plus the `brain/` sections that `00_INDEX.md` maps to it.
2. Look for something to reuse before writing anything new: a component, a helper, a query, and a script in `tools/`.
   If the task uses an outside API or a library feature you have not already used in this repo, send the `researcher` subagent to confirm it exists and how it authenticates and rate-limits. Do not code against an API from memory.
3. State the plan in 8 lines or fewer. If it needs a new dependency, a schema change outside the task, or more than about 6 files, the task is too big: re-slice it in the phase file and continue with the first slice.
4. Be on the phase branch `phase/<N>-<name>`, never `main`.
5. Implement the smallest change that meets the criteria. Follow `.claude/rules/`. Handle the two standing edge cases for anything that talks to the outside: nothing new came back, and the call failed.
6. Data change: write a migration, apply it to the local database, run the tests, note the rollback in the migration.
7. New env var or service: `workflows/08_add-service.md`. If it needs a key from the owner, ask once with full steps, then continue with the next unblocked task.
8. Verify yourself, in this order:
   - `node tools/check.mjs --fast`
   - behaviour: drive the running app with chrome-devtools. Do the task's acceptance steps as a user would. Console and network must be clean.
   - the must-fail case for this task from `brain/08_TEST_PLAN.md`.
   - looks: `workflows/10_visual-qa.md` for every screen the task touched.
9. Add or update tests. Add the flow to `brain/08_TEST_PLAN.md` if new.
10. Commit `feat|fix|chore(scope): what changed`, one task one commit, and push the branch.
11. Close the session with `/handoff` (you run its steps yourself; the owner never types it).

Something failed along the way: run the self-improvement loop in `workflows/README.md` and record the proposed workflow change in STATE before closing the task.

Blocked by something only the owner can give: write exactly what you need under "Waiting on the owner" in STATE, tell them once with steps, move to the next unblocked task.
