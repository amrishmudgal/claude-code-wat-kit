# Design notes

Why the kit is shaped the way it is. Read this before proposing a structural change.

## 1. One self-replacing file

The installer is a `CLAUDE.md` because that is the one file Claude Code reads without being told to. It carries a 20-line extractor and a payload of `=====FILE: path=====` blocks inside a tilde fence, marked as data so the agent does not reason over 145 KB. The agent copies the extractor out, runs it, and the last file written is the short project `CLAUDE.md`, overwriting the installer. The payload is never loaded again.

The extractor checks the file count before writing anything, refuses absolute and `..` paths, and normalises CRLF. The agent is told never to recreate payload files from memory: byte-identical or stop.

## 2. Context is the budget

Everything is arranged around what is loaded when:

| Loaded | What | Size discipline |
|---|---|---|
| Every session | `CLAUDE.md`, and `brain/05_STATE.md` via the SessionStart hook | 60 lines, 60 lines |
| When a kind of work starts | one workflow | one page |
| When matching files are touched | a path-scoped rule file | a screen |
| In a separate context | researcher, reviewer, security-auditor subagents | return conclusions only |
| Never | images from visual QA, env values, the installer payload | tools return numbers and names |

One task per session, then `/clear`. The Stop hook makes that safe by refusing to end a turn while the state file is older than the work.

## 3. Reasoning above, determinism below

A step is pushed into `tools/` when it recurs, must be exact, touches secrets, or spends money, and needs no judgement. The agent decides *which* tool and *when*; it does not re-derive *how*. `visual-diff` is the clearest case: a model judging a screenshot is an opinion, a pixel mismatch percentage is a measurement.

The principle is applied in three layers, because the first alone is not enough:

1. **How the agent works.** Checks, secret scan, env tools, guard, hooks, CI, and the stack's own generators for boilerplate. `tools/README.md` is the registry, so "look for an existing tool first" is a lookup, not a guess. Rule of two: by hand twice, a tool the third time.
2. **How work is proven.** "Done" is an exit code or a number: an automated test per acceptance criterion written before the code, an isolation test per user-data table, `visual-diff`, and `smoke` on preview and production. Browser exploration finds things; only a test proves them, because only a test runs again next week.
3. **How the app is built.** Business rules, money, dates, permissions and state machines live in tested code and database constraints. A model call is an untrusted service at the edge with schema-validated output and a fallback. The product inherits the same 90%-per-step arithmetic as the agent does.

What is deliberately *not* scripted: the release sequence as a whole, debugging, planning. They contain judgement. Script the execution of a decision, never the decision.

## 4. Safety comes from structure, because nobody reads the code

The owner is technically literate but does not review code. So:

- **Hooks, not reminders.** State freshness, context size and dangerous commands are enforced by scripts that exit 2.
- **The release path is the only path.** Direct pushes to `main` and direct production deploys are blocked, so CI, preview verification and the smoke test cannot be skipped.
- **Secrets are structurally out of reach.** Deny rules, guard patterns, names-only tools, a stdin pipe to the host.
- **The owner reviews what they are qualified to review:** scope (PRD), architecture and cost, design direction, ADRs, and the process itself.

## 5. Workflows belong to the owner

The agent learns things every session and forgets them at `/clear`. Lessons must be written down, and the natural place is the workflow. But workflows are the owner's process, and a process that rewrites itself drifts away from the person accountable for it. So lessons are parked as proposals in the state file (which the agent owns), surfaced as a before/after at the end of a task, and applied only after a yes. Enforcement is doubled: a permissions ask-rule on `workflows/**` and a guard block on shell writes.

Path-scoped rule files under `.claude/rules/` are engineering conventions, not process, and the agent maintains those itself.

## 6. Autonomy with four gates

The agent runs everything end to end. It stops for: access only the owner can grant, three product decisions, workflow changes, and scope or money. Everything else is decided, recorded as an ADR if hard to reverse, and reported.

## 7. Stack-agnostic core, optional packs

Nothing in the core names a framework. Vendor knowledge lives in path-scoped rule packs that load only when relevant (`trigger-dev.md` is the first). The default service menu is a starting point the agent may override with an ADR and a swap path.
