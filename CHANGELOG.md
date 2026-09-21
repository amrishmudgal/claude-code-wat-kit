# Changelog

Format: [Keep a Changelog](https://keepachangelog.com). Versions: [SemVer](https://semver.org). A major version means a project built on the previous one needs manual steps to upgrade.

## [0.9.1] - 2026-09-21
Deterministic-first applied across development, not only to the kit's own plumbing.

### Added
- `tools/smoke.mjs` + `tools/smoke.json`: read-only checks against a preview or live URL (status, text, JSON subset, time budget; selector and console errors via Playwright). The exit code decides merge and rollback. Replaces the by-hand browser smoke test.
- `tools/README.md`: tool registry and the rules for a good tool. "Check the registry first, add a row when you create one." Rule of two: by hand twice, a tool the third time.
- Three-layer determinism model in `workflows/README.md`: how the agent works, how work is proven, how the app is built.
- "Deterministic core" block in the backend rules: business logic in pure tested functions and database constraints, explicit state machines, model calls at the edge with schema-validated output, timeouts, cost logging and a non-AI fallback.

### Changed
- `04_build-task`: acceptance criteria become failing automated tests before implementation; the test is the proof and chrome-devtools is for exploration. Generators and CLIs for boilerplate. Smoke check added for every new screen or endpoint.
- `06_security-review`: the two-account isolation test is an automated test per user-data table that runs in `check`, no longer a manual browser exercise.
- `02_stack-selection`: creates the first project tools (reset local DB, seed, generate types) and the first smoke checks.
- `07_release`: smoke runs against the preview before merge and against production after.

## [0.9.0] - 2026-09-20
First public release.

### Fixed
- Build sorted payload files with a locale-dependent comparison, so `dist/CLAUDE.md` differed between macOS and CI runners. Now code-point order, identical everywhere.

### Added
- Self-extracting `dist/CLAUDE.md` installer: 64 files, replaces itself with a project CLAUDE.md under 50 lines. Handles CRLF; refuses a truncated file and writes nothing.
- WAT operating model (`workflows/README.md`), workflow template, fixed order of work, six build questions in discovery and phase planning.
- Self-improvement loop with owner approval: lessons are parked in `brain/05_STATE.md` as proposals; `workflows/**` is on the permissions ask list and shell writes to it are blocked by the guard.
- Eleven workflows: bootstrap, discovery, stack selection, design-first, build task, debug, security review, release, add service, session hygiene, visual QA.
- Tools: preflight, check, secret-scan, env-check, env-push, visual-diff (Playwright + pixelmatch), guard, session-brief, stop-check, notify-slack.
- Hooks: SessionStart state brief, Stop freshness and context-size check, PreToolUse command guard.
- Subagents: researcher, reviewer, security-auditor. Commands: start, build, plan-phase, debug, review, ship, handoff, status.
- Path-scoped rules: frontend, backend-data, testing, trigger-dev.
- Owner profile: technically literate, non-coding. Reports use precise technical language, architecture and ER diagrams in mermaid, no code.
- Dependabot config and a release step that merges green dependency PRs first.
- Repo CI: kit lint, guard rule tests, installer round-trip.
