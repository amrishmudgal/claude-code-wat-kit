# Runbook

## Environments
| | Local | Preview | Production |
|---|---|---|---|
| Where | this machine | one URL per pull request | `main` branch |
| Database | <!-- local --> | <!-- staging --> | <!-- production --> |
| Env values live in | `.env.local` | host, Preview scope (sent by `tools/env-push.mjs` from `.env.production.local`) | host, Production scope (same tool) |
| Who deploys | Claude | automatic on push to a PR | automatic when Claude merges the PR after verifying the preview |
| Real user data | never | never | yes |

## Run it locally
<!-- Exact commands, in order, from a fresh clone. -->

## Release
See `workflows/07_release.md`.

## Roll back
<!-- The exact clicks or command to put the previous production deploy back. How to reverse the last migration. Tried once before launch. -->

## Alerts
<!-- What posts to Slack: failed deploy, server error spike, failed scheduled job, spend threshold. Who reads it. -->

## Accounts
<!-- Service, owner's login email (never passwords), plan, renewal date, where the bill shows up. -->

## Incidents
<!-- Date, what users saw, cause, fix, what changed so it cannot repeat. -->
