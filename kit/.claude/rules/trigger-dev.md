---
paths:
  - "**/trigger/**"
  - "trigger.config.*"
---
# Trigger.dev rules (only when the stack ADR chose Trigger.dev for background jobs)

Proven gotchas. Confirm against the current docs with the `researcher` subagent when the SDK major version differs from 4.

- TypeScript only inside `src/trigger/`. All job code runs as Trigger.dev tasks, never as plain Node scripts. Use native `fetch`.
- One folder per automation: `src/trigger/<automation>/`. One file for simple jobs. Split into a light scheduled check task and a heavy per-item process task when a job polls for new items.
- Import from `@trigger.dev/sdk`. Never `client.defineJob` (v2 syntax, breaks everything). Use `task()`, `schedules.task()` with a `cron` string, or `schemaTask()`.
- Imports between task files need the `.js` extension: `import { processItem } from "./process-item.js"`.
- `triggerAndWait()` returns a Result. Check `result.ok` before `result.output`, or use `.unwrap()`.
- Never wrap `triggerAndWait`, `batchTriggerAndWait` or `wait.*` in `Promise.all`.
- Use an `idempotencyKey` whenever the same item could be triggered twice, for example `item-<id>` when polling.
- Polling on a schedule: make the lookback window slightly larger than the cron interval (25 hours for a daily job) so nothing is missed at the boundary. The idempotency key absorbs the overlap.
- Waits over 5 seconds are checkpointed and do not count as compute.
- Validate every env var at the top of every task and fail with its name: `if (!apiKey) throw new Error("MY_API_KEY is not set")`. Never log the value.
- Third-party IDs (workspace, channel, list) come from env vars too. Do not hardcode them or look them up at runtime when a static value will do.
- The frequency of a scheduled job is a product decision. It is asked once in the feature brief, never guessed.
- Every env var must exist in the Trigger.dev project for each environment, not just locally. Missing dashboard env is the most common production failure.
- When adopted: add the Trigger.dev MCP server to `.mcp.json` (`npx trigger.dev@<pinned version> mcp`) and use it to fire test runs, wait for them, and read run logs. Deploys go through the release workflow (CI on merge), not ad hoc.
- After a deploy: confirm the first run succeeded, confirm the schedule is registered, fire one manual test run.
- When a run fails, check in this order: env var missing in the dashboard, import path without `.js`, API auth (wrong key format, expired key, wrong header name).
