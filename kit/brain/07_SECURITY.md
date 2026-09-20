# Security baseline

> Built in from Phase 4, audited by the security-auditor subagent before launch. Mark N/A with a reason rather than deleting a line.

## Secrets
- [ ] No secret in git, logs, client bundles, error messages or chat. `node tools/secret-scan.mjs` is clean.
- [ ] Browser-exposed variables contain only values safe for the public.
- [ ] Separate keys for local, preview and production. A leaked key is rotated the same day and the rotation is noted in the runbook.

## Identity and access
- [ ] Every private route, server action and API endpoint checks the session on the server.
- [ ] Every read and write checks ownership. Tested: user A cannot read or change user B's data.
- [ ] Row-level rules are on for every table with user data. No table is open by default.
- [ ] Admin or service-role credentials are used only in server code, never shipped to the browser.

## Input and output
- [ ] All input is validated at the server boundary with a schema.
- [ ] No string-built SQL. No user input reaches a shell, `eval`, or raw HTML.
- [ ] File uploads check type, size and name, and are stored outside the web root.
- [ ] Webhooks verify the sender's signature and are safe to receive twice.
- [ ] Errors shown to users contain no stack traces, keys or internal paths.

## Abuse and cost
- [ ] Rate limits on sign-up, login, password reset, and anything that sends email or calls a paid API.
- [ ] Spend caps or alerts set on every paid service.

## Data
- [ ] Personal data collected is listed here, with why and where it is stored: <!-- list -->
- [ ] Backups exist and a restore has been tried once.
- [ ] Account and data deletion is possible.

## AI features (N/A if none)
- [ ] User text cannot override system instructions to reach data or tools it should not.
- [ ] Personal data sent to a model is listed above and the owner has accepted it in writing.
- [ ] Output is checked before it is trusted. A human fallback path exists. A per-user and per-day spend cap exists.

## Dependencies
- [ ] Dev-only tooling (review toolbar, debug panels, seed scripts) is absent from the production bundle. Checked by building for production and searching the output.
- [ ] The stack's audit command shows no critical advisories. Lockfile committed.
