# Tool registry

Every deterministic script in this project, in one place. **Check here before building anything. Add a row when you create a tool.** A tool that is not listed will not be found by the next session, and the work will be redone by hand.

A step belongs in a tool when it (a) recurs, (b) must be exact, (c) touches secrets, or (d) spends money, **and** needs no judgement. If you have done the same sequence by hand twice, the third time is a tool. Tools are engineering: you create and change them without asking. Workflows that call them change only with the owner's yes.

Rules for every tool: one job; usage in the header comment; reads config from a file, not from edits to the script; prints names, counts and numbers, never secret values or large blobs; meaningful exit code (0 ok, 1 failed, 2 blocked, 3 cannot run); safe to run twice.

## Kit tools

| Tool | Job | Run |
|---|---|---|
| `preflight.mjs` | Is this machine ready: git, Node, gh, logins | `node tools/preflight.mjs` |
| `check.mjs` + `checks.json` | Format, lint, typecheck, test, secret scan; build and e2e without `--fast` | `node tools/check.mjs [--fast]` |
| `secret-scan.mjs` | Keys, tokens, private keys in tracked files | runs inside `check` and CI |
| `env-check.mjs` | Env vars by name: SET or MISSING, wrong public prefix | `node tools/env-check.mjs` |
| `env-push.mjs` | Send env values to the host without showing them | `node tools/env-push.mjs --file .env.production.local --target production,preview [--dry-run]` |
| `visual-diff.mjs` + `design/visual.json` | Built screen vs approved design and vs baseline, in pixels | `node tools/visual-diff.mjs [--only x] [--approve]` |
| `smoke.mjs` + `smoke.json` | Read-only checks against a live URL; exit code decides rollback | `node tools/smoke.mjs --url <base>` |
| `guard.mjs` | Blocks dangerous shell commands (hook) | automatic |
| `session-brief.mjs` | Prints STATE into each new session (hook) | automatic |
| `stop-check.mjs` | Refuses to end a turn with stale STATE; context warning (hook) | automatic |
| `notify-slack.mjs` | One-line alert to the owner's webhook | `node tools/notify-slack.mjs "text"` |

## Project tools
<!-- Added by the agent as the project grows. Typical first ones, created in workflows/02_stack-selection.md:
| `db-reset-local.mjs` | Recreate the local database from migrations and seed | ... |
| `seed.mjs` | Deterministic demo data, same every time | ... |
| `gen-types.mjs` | Regenerate types from the database schema | ... |
-->
| Tool | Job | Run |
|---|---|---|
