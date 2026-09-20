# 10 Visual QA (you review the UI, not the owner)

**Goal:** the built screen matches the approved design at every viewport, proven by a script, before the owner hears about it. The owner never takes or sends a screenshot.

**Tools and why these two**
- `tools/visual-diff.mjs` (Playwright + pixelmatch): renders the reference mockup and the live app in the same headless browser at the same size and counts differing pixels. It returns numbers, so it costs almost no context, and it is repeatable. Playwright is also the usual end-to-end test runner, so it is one dependency for both jobs.
- chrome-devtools MCP: a live browser you drive for behaviour, console, network, performance and one-off inspection. Use it to find out why something is off, not to judge whether it is.

## Per screen
1. Dev server running. `node tools/visual-diff.mjs --only <screen>`.
2. Read the table. `design` is app vs mockup (limit 3% by default, and page height within 40 px). `regression` is app vs its own approved baseline (limit 0.2%).
3. If `design` fails: open `.tmp/visual/<screen>-<width>-design-diff.png`. Red clusters show where. Name each difference in concrete terms ("card gap 16 px, mockup 24 px", "heading weight 600, mockup 500"), fix from the tokens in `brain/03_DESIGN.md`, run again. Repeat until it passes. Inspect computed styles with chrome-devtools when the cause is not obvious.
4. Do not game it: never raise a threshold or widen a `mask` to get a pass. Masks are only for content that truly changes between runs. If the mockup itself is wrong or the design changed, fix the mockup and DESIGN first, note why in the commit.
5. When a screen passes `design`, save its baseline: `node tools/visual-diff.mjs --only <screen> --approve`. Commit `design/baselines/`. From now on any task that shifts that screen by more than 0.2% fails `regression`, which is how unrelated work is stopped from quietly breaking finished screens.
6. Intentional change to a finished screen: update mockup and DESIGN, pass `design`, then `--approve` again, and say so in the commit message.
7. Also check what pixels cannot: keyboard focus order and visibility, hover and active states, loading, empty and error states, reduced motion, 768 px. Use chrome-devtools.

## Reporting to the owner
One line with the evidence: "Dashboard passes visual diff against the approved mockup: 0.8% at 375, 1.1% at 1440, threshold 3%. http://localhost:3000/dashboard." If they reply with a change in words, locate the element yourself with chrome-devtools, sort the request (fix, design change, or scope change against the PRD), and act. Only a scope change is a question back to them.

## Optional add-on
If the owner wants to point at things instead of describing them, and the stack is React 18+, Agentation (`npm install agentation -D`, dev-only toolbar) lets them click an element and copy a note with its selector. It is not part of the default path. Install only on request, after checking agentation.com/install and its licence.
