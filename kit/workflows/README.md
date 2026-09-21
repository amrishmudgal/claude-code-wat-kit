# How workflows, the agent and tools fit together (WAT)

**Why this split exists.** AI reasoning is probabilistic. Code is deterministic. If each step of a job is 90% reliable when done by hand, five steps in a row succeed only about 59% of the time. So reasoning stays with the agent, and anything that must come out the same way every time is pushed down into a script. That separation is what makes the project reliable.

| Layer | Where | Job |
|---|---|---|
| Workflows | `workflows/*.md` | The instructions. Plain-language SOPs: objective, inputs, which tools to use, expected output, edge cases, what was learned. |
| Agent | you | The decision-maker. Read the workflow, run tools in the right order, handle failures, keep the system improving. You connect intent to execution. You do not try to do every step by hand. |
| Tools | `tools/*.mjs` | The execution. API calls, checks, comparisons, file and data operations. Consistent, testable, fast. They read secrets from env files so you never have to. |

## How to operate

1. **Workflow first.** Before a kind of work you have a workflow for, open it and follow it. Do not improvise a procedure that is already written down.
2. **Look for an existing tool before building anything.** Check `tools/`. Only write a new script when nothing there does the job.
3. **Do not do by hand what a tool can do.** `tools/README.md` is the registry: read it first, add a row when you create a tool. Rule of two: a sequence done by hand twice becomes a tool the third time. If a step will recur, or must be exact (comparing, counting, migrating, pushing config, calling a paid API), write the tool once, test it, then run it. Example: to check a screen against the design, do not eyeball a screenshot. Run `tools/visual-diff.mjs` and read the number.
4. **Order of work, always:** understand → research → clarify (product questions only, batched) → plan in plain English → build → environment setup → test locally → deploy → verify live. Never skip from idea to deploy.
5. **Paid calls.** Test a tool that spends money or credits once, on the smallest input. Never retry a paid call in a loop. If getting it right will take more than a few paid runs, tell the owner the expected cost first. This is a spending question, not an engineering one.

## Where determinism applies: three layers

| Layer | Probabilistic (you) | Deterministic (code) |
|---|---|---|
| **How you work** | Choosing the workflow, planning, diagnosing | Checks, secret scan, env audit and push, guard, hooks, CI, generators and CLIs for boilerplate (migrations, types from schema, scaffolds) |
| **How the work is proven** | Deciding what is worth testing; exploring with chrome-devtools | An automated test per acceptance criterion, the must-fail and two-account isolation tests, `visual-diff` numbers, `smoke` exit code. You never report "it works" on the strength of having looked |
| **How the app itself is built** | Only the parts of the product that truly need language or judgement | Business rules, money, dates, permissions, state transitions and calculations live in plain tested code and database constraints. An LLM call sits at the edge, returns schema-validated data, and never decides what gets written or charged |

What stays with you: anything needing judgement. Do not script a decision; script the execution of it.

## The self-improvement loop

Every failure makes the system stronger, or it will happen again next session when you remember nothing:

1. Identify what broke. Read the full error and trace, not the first line.
2. Fix the tool or the code. If the failure came from doing a step by hand, the fix is a tool.
3. Verify the fix works.
4. Capture what you learned as a proposed change to the workflow it belongs to: rate limits, timing quirks, a batch endpoint you found, an assumption that was wrong. One or two dated lines for its `## Learned` section, or a corrected step. Write the proposal into `brain/05_STATE.md` straight away so it survives the session.
5. Get the owner's yes, apply it, and move on with a more robust system.

Example: a tool gets rate-limited. You read the API docs, find a batch endpoint, refactor the tool to use it, confirm it works, and propose a Learned line so no future session hits the same wall.

## Keeping workflows current

Workflows are the owner's standing instructions, and the owner must always know what they say. Refine them, do not toss them after one use, and **never create, edit, overwrite or delete one without the owner's explicit yes.** This applies to every change, including a one-line Learned entry.

The protocol:
1. The moment you learn something, add an entry under "Proposed workflow changes" in `brain/05_STATE.md`: the file, the exact text to add or change, the reason, the date. STATE is yours to write, so the lesson is safe even if the session ends.
2. Until it is approved, the next session still sees it, because STATE is printed into every session.
3. In your end-of-task report, show each open proposal as a small before/after and ask once: "Apply these workflow changes? yes / no / edit". Batch them. Do not interrupt a task to ask.
4. On yes: make the change with the Edit tool (Claude Code will also show its own confirmation, by design), commit it as `docs(workflows): ...`, remove the entry from STATE.
5. On no: remove the entry. If the owner gave a reason, record it under "Watch out" so it is not proposed again.
6. A new workflow for recurring work (a data import, a weekly report, a scraping run) follows the same path: propose the objective and steps first, copy `_TEMPLATE.md` after a yes.
7. A change that reverses what a workflow is for also gets an ADR in `brain/06_DECISIONS.md`.

This is enforced twice: `.claude/settings.json` puts edits under `workflows/` on the ask list, and `tools/guard.mjs` blocks shell writes into that folder.

## Files

- `.tmp/` is disposable: scraped data, intermediate exports, screenshots, diffs. Anything in it can be regenerated. Nothing the project depends on lives there.
- What the owner needs to see lives where they can reach it without a terminal: the running app, the live URL, a Slack message, the PR description.
