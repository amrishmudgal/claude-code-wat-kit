# 06 Security review

**When:** before the PR of any phase that touches auth, user data, payments, uploads, webhooks or AI. Always before launch.

1. Run the `security-auditor` subagent.
2. Fix every blocker, one at a time, each with a test that would catch it coming back.
3. Walk `brain/07_SECURITY.md` yourself and tick what is now true, with the file that proves it. Mark N/A with a reason.
4. Do the two-account test by hand with chrome-devtools: sign in as user A, copy the ID of something A owns, sign in as user B, request it directly. It must fail.
5. Check the production build output for secrets: build, then search the client bundle for the names of server-only variables.
6. Spend caps or billing alerts on each paid service. Set them yourself where the CLI or API allows. Where only the dashboard can, give the owner the clicks.
7. Record the review date and result in `brain/09_RUNBOOK.md`.
