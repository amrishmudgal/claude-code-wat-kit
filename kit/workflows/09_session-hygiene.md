# 09 Session hygiene

**Why:** long conversations make the model worse and more expensive at once. Early instructions get diluted, stale file contents get trusted, every turn re-sends the history. Short sessions with the truth in the repo fix this. The owner will not manage any of it, so you and the hooks do.

## The rhythm
any first message → continue from STATE → one task → close it out yourself → tell the owner: "Please type /clear and then type go."

## What runs without anyone remembering
- SessionStart hook prints `brain/05_STATE.md` at startup, after `/clear`, and after a compaction.
- Stop hook (`tools/stop-check.mjs`) refuses to let you finish a turn if project files are newer than STATE, and tells you when the conversation passes about 120k tokens.
- Auto-compaction is capped at 200k tokens in `.claude/settings.json`. If the owner ignores the `/clear` request, the cap and the re-printed STATE keep the project aligned anyway.

## Close a session early when
- the stop hook says the conversation is heavy
- you re-read a file you already read, or are unsure what a file contains now
- you are about to contradict `brain/06_DECISIONS.md` or the design tokens
- a second fix for the same bug failed
- the work is changing kind: building to debugging, one feature to another

## Rules
- STATE is rewritten at the end of every task and whenever you stop to wait for the owner. It is always true.
- Prefer a fresh session over `/compact`. Compaction is a lossy summary; STATE is a deliberate one.
- Do not change model mid-session. It discards the prompt cache. Switch at a `/clear`.
- Exploration and research run in subagents. Only conclusions enter this context.
- Never load big logs or screenshots into the conversation when a script can return a number. Read `.tmp/` files by line range. Open a diff image only for a failing screen.
- Auto memory stays on one machine. Anything the project depends on is written to `brain/`.
