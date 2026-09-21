# Verification status

What has been proven, how, and what still needs a live confirmation. Honest gaps beat confident guesses.

## Proven by automated tests (run in CI on every push)

| Claim | Test |
|---|---|
| `dist/CLAUDE.md` is current with `kit/` | `tests/roundtrip.mjs` rebuilds and compares |
| The installer reproduces `kit/` byte for byte | same, using the Extractor block copied out of the file exactly as the agent does |
| A Windows (CRLF) copy of the file installs correctly | same |
| A truncated file is refused and nothing is written | same |
| Every guard rule blocks what it should and allows normal work | `tests/guard.test.mjs`, 25 block and 20 allow cases |
| Malformed hook input never turns the guard into a block-everything | same |
| `smoke.mjs` passes on good responses, fails on wrong status, missing text, wrong JSON and an empty config, against a local server | `tests/smoke.test.mjs` |
| All tool scripts parse, all JSON parses, doc links to kit files resolve, no secrets in the repo | `tests/kit-lint.mjs` |
| `kit/CLAUDE.md` stays at 60 lines or fewer | same |

## Checked against Claude Code documentation, awaiting broad live confirmation

| Item | What could differ by version |
|---|---|
| `permissions.ask` with `Edit(./workflows/**)` and `Write(./workflows/**)` | Path-pattern anchoring |
| `Bash(git:*)`-style allow rules | Newer docs show `Bash(git *)`; both forms are documented as accepted |
| `Stop` hook exiting 2 to keep the turn open | Hook output contract |
| `SessionStart` hook stdout entering context after `/clear` and compaction | Matcher behaviour |
| `CLAUDE_CODE_AUTO_COMPACT_WINDOW` env setting | Variable name |
| Plugin ids under `enabledPlugins` | Marketplace naming |

## Needs a real machine

| Item | Why it cannot be tested in CI |
|---|---|
| `tools/smoke.mjs` browser checks (`selector`, `noConsoleErrors`) | Needs a Chromium download; the HTTP checks are covered in CI |
| `tools/visual-diff.mjs` end to end | Needs a Chromium download and a running app |
| `tools/env-push.mjs` stdin pipe into `vercel env add` | Needs a Vercel login |
| Full run from empty folder through Phase 4 (live URL with auth) | Needs accounts and a Claude Code session |

If you confirm or break any of these, open an issue with your OS, `claude --version`, and what you saw. That is the most valuable contribution right now.
