---
paths:
  - "**/api/**"
  - "**/server/**"
  - "**/services/**"
  - "**/lib/**"
  - "supabase/**"
  - "**/migrations/**"
  - "**/*.sql"
  - "**/*.py"
---
# Backend and data rules

- Validate input at every trust boundary: request bodies, query params, webhooks, file uploads, anything from an LLM.
- Authorisation is checked on the server for every read and write. The client is never trusted to say who the user is.
- UI components do not talk to the database. Data access sits in one layer named in `brain/02_ARCHITECTURE.md`.
- Every schema change is a migration file in the repo. Migrations are reversible or come with a written rollback. Never edit a migration that has already run in the cloud.
- Every table holding user data has row-level access rules before it holds real data. Test that user A cannot read user B's rows.
- Anything that can take longer than about 2 seconds goes to a background job with a visible status, not a blocking request.
- Calls to outside services have a timeout, a retry policy where it is safe, and a handled failure path. Use an idempotency key when the same event could arrive twice.
- Read every required env var once at startup or at the top of the job, and fail immediately with the variable's name if it is missing. Never log the value. Third-party IDs (workspace, channel, list) are env vars too, not hardcoded and not looked up at runtime.
- Scheduled polling uses a lookback window slightly larger than the interval, with idempotency absorbing the overlap.
- Log events, never secrets or personal data.

## Deterministic core
- Business rules, money, dates, permissions, quotas, state transitions and calculations are plain functions with unit tests. Invariants that must never break are also database constraints (not null, unique, check, foreign key), so a bug in code cannot corrupt data.
- Statuses are an explicit state machine: a fixed list of states and allowed transitions, enforced in one place.
- A model call is an untrusted outside service at the edge. Input is assembled by code. Output is parsed against a schema and rejected if it does not fit. The model never decides what is written, charged, sent or deleted: it returns data, and code decides. No arithmetic, date maths or ID lookups by a model.
- Every model call has a timeout, a retry limit, a logged cost, and a non-AI fallback path.
- Same input, same output: no hidden dependence on the clock, random values or request order in business logic. Pass them in.
