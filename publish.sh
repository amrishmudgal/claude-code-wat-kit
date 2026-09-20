#!/usr/bin/env bash
# One-time publish of this folder to your GitHub account as a public repo.
# Needs: git, Node 20+, GitHub CLI logged in (gh auth login). No token is typed, pasted or stored here.
set -euo pipefail
REPO="claude-code-wat-kit"
DESC="One file turns an empty folder into a governed Claude Code project: WAT workflows, project memory, guard hooks, pixel-diff visual QA, and a self-improvement loop you approve. Built for technical people who do not code."
TOPICS="claude-code,claude,anthropic,ai-agents,agentic-coding,vibe-coding,claude-md,developer-tools,project-template,workflow-automation,playwright,visual-regression,no-code-founders"

command -v gh >/dev/null || { echo "Install GitHub CLI first: https://cli.github.com  then run: gh auth login"; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Run: gh auth login   (choose GitHub.com, HTTPS, login with a web browser)"; exit 1; }
OWNER="$(gh api user -q .login)"
echo "Publishing as $OWNER/$REPO (public)"

npm test
if grep -q "OWNER/claude-code-wat-kit" README.md; then
  sed -i.bak "s#OWNER/claude-code-wat-kit#$OWNER/$REPO#g" README.md && rm -f README.md.bak
fi
[ -d .git ] || git init -q -b main .
git add -A
git -c user.name="$(gh api user -q '.name // .login')" -c user.email="$(gh api user -q .id)+$OWNER@users.noreply.github.com" \
  commit -q -m "feat: claude-code-wat-kit v0.9.0" || true

gh repo create "$REPO" --public --source . --remote origin --description "$DESC" --push
gh repo edit "$OWNER/$REPO" --add-topic "$TOPICS" --enable-issues --enable-discussions=false --enable-wiki=false \
  --delete-branch-on-merge --enable-squash-merge --enable-merge-commit=false
gh api -X PUT "repos/$OWNER/$REPO/private-vulnerability-reporting" >/dev/null 2>&1 || echo "note: enable 'Private vulnerability reporting' under Settings → Security if you want the SECURITY.md button to work"

git tag v0.9.0 && git push -q origin v0.9.0     # triggers the release workflow, which attaches dist/CLAUDE.md
echo
echo "Live:     https://github.com/$OWNER/$REPO"
echo "Install:  curl -fsSLo CLAUDE.md https://raw.githubusercontent.com/$OWNER/$REPO/main/dist/CLAUDE.md"
echo "Next:     Settings → Branches → protect main (require the 'verify' check) once the first CI run is green."
