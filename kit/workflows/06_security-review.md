# 06 Security review

**When:** before the PR of any phase that touches auth, user data, payments, uploads, webhooks or AI. Always before launch.

1. Run the `security-auditor` subagent.
2. Fix every blocker, one at a time, each with a test that would catch it coming back.
3. Walk `brain/07_SECURITY.md` yourself and tick what is now true, with the file that proves it. Mark N/A with a reason.
4. The two-account isolation test must exist as an automated test and run in `check`: user B requests, updates and deletes a record owned by user A, by ID, through the API and directly against the database with B's session. Every attempt must fail. One case per table that holds user data; a new table without a case is a blocker. Explore by hand with chrome-devtools if you like, but only the automated test counts, because it reruns on every change.
5. Check the production build output for secrets: build, then search the client bundle for the names of server-only variables.
6. Spend caps or billing alerts on each paid service. Set them yourself where the CLI or API allows. Where only the dashboard can, give the owner the clicks.
7. Record the review date and result in `brain/09_RUNBOOK.md`.
