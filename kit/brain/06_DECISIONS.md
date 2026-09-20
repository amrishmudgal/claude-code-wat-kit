# Decisions

> Append-only. Binding. To change a decision, add a new entry that supersedes the old one, and get the owner's yes.
> Log a decision when it is hard to reverse or when a future session might be tempted to "fix" it.

## ADR-000: Project operating model
- **Date:** <!-- bootstrap date -->
- **Decision:** Claude runs all engineering end to end, including git, database, hosting, email setup, releases and rollbacks. The owner supplies access (accounts, logins, keys, DNS, card), three product decisions (PRD, architecture and cost, design direction), approval of every change to `workflows/`, and any scope or spending change. Work is local first, then phase branch → PR → CI → preview verified by Claude → merge → production smoke test. All project knowledge lives in `brain/`. Secrets live in gitignored env files and never enter the repo or the chat.
- **Because:** The owner understands systems and process but has never written code, so they will not review code. Code-level safety therefore comes from scripts, hooks, CI, visual diffs and rollback. They can and do review architecture, scope and process, which is why workflows change only with their approval and hard-to-reverse choices are written as ADRs.
- **Would reverse if:** A developer joins who should review PRs, or the app holds data where a human sign-off on releases is required.

<!-- Template
## ADR-00N: <title>
- **Date:**
- **Decision:**
- **Options considered:** (with the reason each lost)
- **Because:**
- **Cost:** money per month at expected usage, and the free-tier limit that would be hit first
- **Swap path:** what it takes to move off this later
- **Would reverse if:**
- **Supersedes:** ADR-00X (if any)
-->
