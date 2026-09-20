# 00 Bootstrap

**Goal:** a working repo on GitHub with guards, plugins and browser tooling in place. No product decisions yet.
**Owner input needed:** project name. A GitHub login if `gh` is not authenticated. Nothing else.

1. Run `node tools/preflight.mjs`. For each missing required tool, give the owner the official install command for their system, one at a time, and re-run until it passes. Install anything you can install yourself without them.
2. Confirm the extraction worked: `CLAUDE.md` is now the short version (under 60 lines), and `.claude/`, `brain/`, `workflows/`, `tools/` exist. If not, stop and report. Do not recreate files from memory.
3. Ask for a project name. Make it a lowercase-hyphen repo name.
4. `git init` if needed, branch `main`, `node tools/secret-scan.mjs`, first commit.
5. If `gh auth status` fails, walk the owner through `gh auth login` (browser method). Then `gh repo create <name> --private --source=. --push`. This is the only time anything goes straight to `main`.
6. Tool dependencies for visual QA: `npm --prefix tools install` then `npx --prefix tools playwright install chromium`. Confirm with `node tools/visual-diff.mjs --compare` on any two PNGs or skip the confirm if none exist yet.
7. Official-marketplace plugins, project scope. Run each and record failures without stopping:
   - `claude plugin install security-guidance@claude-plugins-official --scope project`
   - `claude plugin install commit-commands@claude-plugins-official --scope project`
   - `claude plugin install github@claude-plugins-official --scope project`
   If one is not found: `claude plugin marketplace update claude-plugins-official`, retry once, move on.
   Anything outside the official marketplace runs code on the owner's machine, so it needs their yes.
8. `.mcp.json` already declares `chrome-devtools`. On Windows, if it fails to start, change it to `"command": "cmd"` with args `["/c", "npx", "-y", "chrome-devtools-mcp@latest"]`.
9. Fill ADR-000's date. Rewrite `brain/05_STATE.md`: phase 1, Next action "Run workflows/01_discovery.md: interview the owner". Commit on `phase/0-bootstrap`, push, open a PR, wait for CI, merge it yourself (`gh pr merge --squash --delete-branch`), `git checkout main && git pull`.
10. Tell the owner: "Setup is done. Please quit Claude Code, open it again in this folder, say yes if it asks about the chrome-devtools server, and type go. I will then ask you about your idea."

**Exit check:** repo on GitHub with a merged PR, `node tools/check.mjs` passes, `.claude/settings.json` hooks present.
