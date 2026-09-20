# 08 Add a service (and its keys)

**Rule:** you do all the configuration. The owner only does what needs their identity: sign up, log in, create a key, DNS at their registrar, a card. You never see a secret value.

1. One message to the owner: what the service is for in one sentence, what it costs now and at the first paid step (verified today by the `researcher` subagent), the exact sign-up URL.
2. Click-by-click steps to get what you need, with the least privilege that works. Typical one-time asks:
   - GitHub: `gh auth login`
   - Supabase: sign up, then `supabase login` in the terminal (opens the browser). You create the project, link it, run migrations, configure auth settings and storage yourself with the CLI.
   - Vercel: sign up with GitHub, then `vercel login`. You link the project, connect the repo, set env with `tools/env-push.mjs`, manage domains yourself.
   - Resend: create one API key. You add the sending domain through the API and fetch the DNS records. If the domain's DNS is on the host you already control, add the records yourself. If it is at an outside registrar, give the owner the exact records to paste.
   - Slack: create one incoming webhook URL.
   - Modal, Sentry and others: one token each, then you configure the rest.
3. Tell the owner exactly which file and which variable name each value goes under: `.env.local` for local values, `.env.production.local` for live values. Both are gitignored. They paste values in their editor, never in chat. If a secret lands in chat, tell them to revoke it and make a new one, and do not repeat it.
4. Add the names to `.env.example` with a comment saying where the value comes from. Mark `# optional` where the app runs without it.
5. `node tools/env-check.mjs` and `node tools/env-check.mjs .env.production.local` until required names show SET.
6. `node tools/env-push.mjs --file .env.production.local --target production,preview`. The tool moves values to the host; you only see names.
7. Write the smallest smoke test for the connection, run it locally, show the result.
8. Record in `brain/02_ARCHITECTURE.md` under Outside services: purpose, variable names, the free-tier limit that matters, behaviour when it is down. Add the account to `brain/09_RUNBOOK.md`.
9. Official plugin available: install at project scope if it helps. Prefer the service's CLI for routine work, because it needs one login and no repeated approval.

While waiting for the owner, keep working on tasks that do not need the key.
