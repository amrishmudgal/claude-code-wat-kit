---
description: Project status report for the owner, the way a delivery lead would want it. Read-only.
---
Produce a status report. Change nothing. Read `brain/04_PLAN.md`, `brain/05_STATE.md`, the current phase file, and run `git log --oneline -15`, `gh pr list`, `node tools/env-check.mjs`.

Report, in this order, no code:
1. **Where we are:** phase N of M, tasks done / total in this phase, what is live and where.
2. **Since last report:** what shipped, by PR.
3. **Next:** the next three tasks.
4. **Risks and debts:** known issues, anything failing, dependencies waiting to be updated.
5. **Waiting on you:** access items, open decisions, proposed workflow changes awaiting a yes.
6. **Running cost:** services in use and their current monthly cost from `brain/02_ARCHITECTURE.md` and the stack ADR. Say "not recorded" rather than guess.
7. **Scope check:** anything built or requested that is not in `brain/01_PRD.md`.
