# Changelog

Format: [Keep a Changelog](https://keepachangelog.com). Versions: [SemVer](https://semver.org). A major version means a project built on the previous one needs manual steps to upgrade.

## [0.9.0] - 2026-09-20
First public release.

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
