# Contributing

## Ground rules

1. **Edit `kit/`, never `dist/`.** `dist/CLAUDE.md` is generated. Run `npm run build` and commit both. CI fails when they disagree.
2. **`kit/CLAUDE.md` stays at 60 lines or fewer.** It is loaded into every session of every project. Detail belongs in a workflow, which is read only when needed. CI enforces the limit.
3. **Every guard rule has a test.** Adding or changing a pattern in `kit/tools/guard.mjs` means adding BLOCK and ALLOW cases to `tests/guard.test.mjs`. A guard that blocks legitimate work gets removed by frustrated users, so the ALLOW cases matter as much.
4. **Tools are deterministic and dependency-light.** Node standard library first. A new dependency needs a reason in the PR. Tools never print secret values, only names and status.
5. **Stack-agnostic by default.** Anything specific to a framework or vendor goes in a path-scoped file under `kit/.claude/rules/` so it costs nothing elsewhere.
6. **Write for the owner the kit is built for:** technically literate, does not code. Precise terms, no syntax, no tutorials on what git is.
7. **No client or company specifics** in examples. Use neutral placeholders.

## Workflow

```bash
npm test            # must pass
npm run build       # regenerate dist/CLAUDE.md
npm test            # confirms dist is current
```

Then try it for real: copy `dist/CLAUDE.md` into an empty folder, run `claude`, type `go`. If your change touches hooks, permissions or the installer header, say in the PR what you observed in a live Claude Code session and which version (`claude --version`). Update [docs/VERIFICATION.md](docs/VERIFICATION.md) when you confirm something listed there.

## Commit style

Conventional commits: `feat(tools): …`, `fix(guard): …`, `docs(workflows): …`. Add a line to `CHANGELOG.md` under Unreleased.

## Good first contributions

- Confirm an item in docs/VERIFICATION.md on your OS and Claude Code version
- A rule pack for a job platform or framework you know well
- Guard patterns for a host or database CLI not yet covered (with tests)
