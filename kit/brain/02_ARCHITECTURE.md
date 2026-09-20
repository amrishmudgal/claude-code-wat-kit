# Architecture

> Written in workflows/02_stack-selection.md. Every choice here has an ADR in 06_DECISIONS.md.

## Stack
| Layer | Choice | Why this, for this PRD | Swap path |
|---|---|---|---|
| Frontend | | | |
| Backend / API | | | |
| Database | | | |
| Auth | | | |
| File storage | | | |
| Background jobs / heavy compute | | | |
| Email | | | |
| Hosting | | | |
| Errors and alerts | | | |

## Components and request flow
<!-- A mermaid flowchart (renders on GitHub): user → UI → server → data → outside services. Keep it current; the owner reads this instead of the code. -->

## Data model
<!-- A mermaid erDiagram of the tables and relations, updated in the same commit as any migration. -->

## Folder layout
<!-- The real tree of the app code, and one line on what belongs in each folder. -->

## Boundaries
<!-- e.g. UI never queries the database directly. All database access goes through <folder>. Secrets are server-only. -->

## Data model
<!-- Tables or collections, key fields, relations, who may read and write each. -->

## Outside services
<!-- For each: what it is used for, env var names, free-tier limit that matters, what happens when it is down. -->

## AI features (delete if none)
<!-- First question: does this need an LLM, or does a rule, query or existing API do it? -->
For each AI feature record: how it can fail, cost per run, latency budget, what "correct" means and how it is checked, and the path for a human when it is wrong.
