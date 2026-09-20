# Brain index

Everything the project knows lives here, in git. Read only what the task needs.

| Question | File | Read when |
|---|---|---|
| Where are we, what is next? | `05_STATE.md` | start of every session |
| What is the current task list? | `phases/P<N>-*.md` | start of every session |
| What are we building, for whom, what is out of scope? | `01_PRD.md` | planning, any scope doubt |
| What stack, which folders, how data flows? | `02_ARCHITECTURE.md` | planning, new module, new table |
| How should it look, feel and read? | `03_DESIGN.md` + `../design/mockups/` + `../design/visual.json` | any UI work |
| What are the phases? | `04_PLAN.md` | planning a phase |
| Why did we choose X? May I change it? | `06_DECISIONS.md` | before proposing any change of direction |
| What must be true for this to be safe? | `07_SECURITY.md` | auth, data, uploads, webhooks, AI, pre-launch |
| What does "working" mean? | `08_TEST_PLAN.md` | writing tests, phase exit |
| How do we run, deploy, roll back, get alerted? | `09_RUNBOOK.md` | environments, release, incident |

Rules for these files
- `05_STATE.md` is rewritten every handoff and stays under 60 lines. `06_DECISIONS.md` is append-only. The rest change only when reality changes, in the same commit as the code that changed it.
- A document that describes an app that no longer exists is worse than no document. If you notice drift, fix the doc in that session.
- Deep specs (data model, API contract, scraping, payments, AI feature) start as sections of `02_ARCHITECTURE.md`. Split one into its own numbered file only when its section passes about 80 lines, and add it to this table.
- What the agent has learned about tools, limits and quirks is not here. Approved lessons live under `## Learned` in the workflow they belong to. Lessons waiting for the owner's yes sit in `05_STATE.md` (`workflows/README.md` explains the loop).
- There is no changelog file. `git log` with conventional commits is the changelog.
