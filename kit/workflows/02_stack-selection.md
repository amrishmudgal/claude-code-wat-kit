# 02 Stack selection and architecture

**Goal:** you choose the stack that best fits the PRD. The owner approves one plain-language summary. They are never asked to pick a technology.

## How to choose
1. List what the PRD actually demands: web or mobile or both, auth, data shape, files, real-time, scheduled or long-running work, email, payments, AI, expected users, budget.
2. For each layer, pick the most boring option that meets the demand. Boring means: widely used, well documented, generous free tier, managed rather than self-hosted, and well represented in your training data so you make fewer mistakes with it.
3. Defaults to beat. Use these unless the PRD gives a reason not to, and write the reason in the ADR when you deviate:
   - Web app with accounts and data: TypeScript, a full-stack React framework, Postgres with built-in auth and row-level security (Supabase), hosted on Vercel, GitHub for code and CI.
   - Transactional email: Resend.
   - Work longer than a request can wait, Python-only libraries, GPUs, heavy scraping or batch jobs: a job runner (Modal for Python compute, or a TypeScript job platform such as Trigger.dev). Pick one, not both.
   - Alerts: a Slack incoming webhook via `tools/notify-slack.mjs`. Error tracking: Sentry.
   - Content site with no accounts: a static site generator, no database.
   - Mobile: decide native versus installable web app from the PRD, not from habit.
4. One language across app and tools where possible. `tools/` ships as Node so it runs on every OS. Add Python tools only if the stack is Python.
5. Send the `researcher` subagent to verify, today, for every paid-capable service: free-tier limits, first paid price, the limit this app will hit first, and that the versions and APIs you plan to use exist. Never quote a price from memory.
6. If the app has an AI feature, first ask whether a rule, query or normal API does the job. Most "AI features" are 90% ordinary code with one model call in the middle: design them that way. If an LLM is needed, record failure mode, cost per run, latency budget, definition of correct, human fallback, and the model swap path.

## Write it down
- Fill `brain/02_ARCHITECTURE.md` completely, including folder layout, boundaries and data model.
- One ADR per layer in `brain/06_DECISIONS.md`, each with cost and swap path.
- Fill `tools/checks.json`, the first checks in `tools/smoke.json` (home page, health endpoint, a private URL that must redirect or return 401), and the Project commands block in `CLAUDE.md`.
- Create the first project tools and register them in `tools/README.md`: reset the local database from migrations, seed deterministic demo data, regenerate types from the schema. Prefer wrapping the stack's own CLI over writing logic. Playwright is already installed under `tools/` for visual QA; use it as the end-to-end runner too unless the stack has a strong native one.
- Fill the Levels section of `brain/08_TEST_PLAN.md` and the Environments table in `brain/09_RUNBOOK.md`.
- Add stack-specific entries to `.gitignore`, a CI job to `.github/workflows/ci.yml`, and the app's package ecosystem to `.github/dependabot.yml`.
- Draw the component flowchart and the ER diagram in `brain/02_ARCHITECTURE.md` (mermaid).

## Owner approval, one message
"Here is the architecture: components and how they talk, where data lives, how auth works, how it deploys, in one short diagram or list. For each main choice, the alternative I rejected and why, and the swap path if it has to change later. It costs about X per month at the start and Y if you reach Z users. You will need to sign up for: A, B, C, which takes about N minutes and needs a card for: ... The main trade-off I made is ... Say yes, or tell me what worries you." The owner can judge architecture and trade-offs, so give them real ones, not reassurance. They do not judge libraries or syntax, so leave those out. This is one of only three product decisions the owner makes. After it, you do not ask about technology again; later hard-to-reverse choices go into `brain/06_DECISIONS.md` as ADRs they can read.

After the yes
- If a background-job platform was chosen, add its MCP server to `.mcp.json` with a pinned version so you can fire test runs and read run logs yourself. For Trigger.dev the proven rules are already in `.claude/rules/trigger-dev.md`. For any other platform, write the equivalent rule file from the researcher's brief.
- Install the matching official plugins, project scope: for example `supabase`, `vercel`, `sentry`, `slack`, and the code-intelligence plugin for the language (it needs the language server binary installed first).
- Run `workflows/08_add-service.md` once per service, back to back, so the owner does every sign-up and login in one sitting and is not interrupted again.
- `/handoff`.

**Exit check:** a new engineer could read ARCHITECTURE and DECISIONS and know what to build with and why. The owner knows the monthly cost.
