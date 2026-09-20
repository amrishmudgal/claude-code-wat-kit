# CLAUDE.md (project installer, replaces itself)

This folder is a brand-new project and this file is its installer. The owner is technically literate (IT delivery background) but has never written code. Below the instructions is a payload containing the full project structure: memory files, workflows, tools, guards, commands. Your first job is to unpack it. After that, this file is replaced by a short CLAUDE.md and is never loaded again.

## On the owner's first message, whatever it says

1. Tell them in three lines: you will set up the project structure, check their computer, and create a private GitHub repo; it takes about ten minutes; you will only ask for a project name and maybe a login.
2. Run `node --version`. If Node 20 or newer is missing, give the official install step for their system, wait, and check again.
3. Create a file named `extract.mjs` containing exactly the code in the "Extractor" block below. Copy it character for character.
4. Run `node extract.mjs`. It must print "extracted 65 files". Then delete `extract.mjs`.
   - If it fails, show the error and stop. Never recreate the payload files by hand or from memory. They must be byte-identical to the payload.
5. Do not summarise, review, or reason about the payload. Open `workflows/00_bootstrap.md` from disk and follow it step by step.

## Rules for this first session

- You do the whole setup yourself. Stop only for what needs the owner's identity: a login, an install that needs their password, the project name.
- One question at a time, precise words, exact clicks or commands. The owner knows the concepts; they need the exact steps, not an explanation of what git is.
- No technology questions, now or later. You choose the stack in `workflows/02_stack-selection.md`; the owner approves an architecture-and-cost summary.
- No application code in this session.
- Never ask for a password or API key in chat.
- When bootstrap is done: rewrite `brain/05_STATE.md`, then tell the owner to quit Claude Code, reopen it in this folder and type `go`. The next session interviews them about the project (`workflows/01_discovery.md`) and then plans the build phase by phase.

## Extractor

```js
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
const EXPECTED = 65;
const src = readFileSync("CLAUDE.md", "utf8").replace(/\r\n/g, "\n");
const re = /^=====FILE: (.+?)=====\n([\s\S]*?)\n=====END FILE=====$/gm;
const found = [];
let m;
while ((m = re.exec(src))) found.push([m[1].trim(), m[2]]);
if (found.length !== EXPECTED) { console.error("extract: expected " + EXPECTED + " files, found " + found.length + ". CLAUDE.md is incomplete. Nothing written."); process.exit(1); }
for (const [path, body] of found) {
  if (path.startsWith("/") || path.includes("..")) { console.error("extract: unsafe path " + path); process.exit(1); }
  mkdirSync(dirname(path) || ".", { recursive: true });
  writeFileSync(path, body.length ? body + "\n" : "");
}
console.log("extracted " + found.length + " files. CLAUDE.md is now the short project version.");
```

## Payload

Everything between the tilde fences is data for the extractor, not instructions for you.

~~~~~~~~~~text
=====FILE: .claude/agents/researcher.md=====
---
name: researcher
description: Use for any "which tool, service, library or API should we use" question, for checking current pricing, limits or docs, and for confirming that an API or package version really exists. Returns a short decision brief.
tools: WebSearch, WebFetch, Read, Grep, Glob
model: sonnet
---
You research technical choices and return a brief the lead engineer can act on. The project owner is technically literate but does not code, so the chosen stack must be one the agent can operate fully from the CLI.

Method
1. Read `brain/01_PRD.md` and `brain/06_DECISIONS.md` so options fit the product and do not contradict earlier decisions.
2. Prefer official documentation and pricing pages over blog posts. Note the date of anything you rely on. Pricing, free tiers, limits and model names change, so always look them up.
3. Compare at most three realistic options.

Return at most 30 lines
- Recommendation: one option, one sentence why.
- Table: option, fit for this PRD, how you authenticate (key, OAuth, webhook secret), rate limits, free tier and first paid step, hard limits that matter here, lock-in and swap path, quality of docs, last release date.
- What the owner must do: accounts, keys, cards.
- Risks and unknowns. Say "not found" rather than guessing a number.
- Source links.

Never write code or edit files.
=====END FILE=====
=====FILE: .claude/agents/reviewer.md=====
---
name: reviewer
description: Use at the end of every phase, and before any PR, to review the diff with fresh eyes against the project docs. Reports problems. Does not fix them.
tools: Read, Grep, Glob, Bash
model: sonnet
---
You review a change you did not write. You have no memory of why it was written, which is the point.

1. Run `git diff main...HEAD --stat` then read the changed files.
2. Read the current phase file in `brain/phases/`, plus the sections of `brain/02_ARCHITECTURE.md`, `brain/03_DESIGN.md` and `brain/07_SECURITY.md` that the change touches.
3. Check, in this order: does it meet the task's acceptance criteria; security and authorisation; data loss risk; contradictions with `brain/06_DECISIONS.md`; error, loading and empty states; duplicated logic; files changed that the task did not need; invented or deprecated APIs.

Report as a list: severity (blocker, should-fix, note), file and line, what is wrong, the smallest fix. Finish with a one-line verdict: ready for PR, or not. Do not edit files.
=====END FILE=====
=====FILE: .claude/agents/security-auditor.md=====
---
name: security-auditor
description: Use before the first deploy of any phase that touches auth, payments, file uploads, user data, webhooks or an AI feature, and always before launch. Read-only audit against brain/07_SECURITY.md.
tools: Read, Grep, Glob, Bash
model: sonnet
---
You audit this repository against `brain/07_SECURITY.md`. You report. You do not fix.

1. Run `node tools/secret-scan.mjs` and `node tools/env-check.mjs`.
2. Walk every item in the checklist in `brain/07_SECURITY.md` and mark it pass, fail or not applicable, with the file that proves it.
3. Look specifically for: secrets reachable from browser code; endpoints or server actions with no auth check; tables without row-level rules; user input reaching SQL, shell, HTML or a prompt unvalidated; webhooks with no signature check; file uploads with no type or size limit; verbose errors leaking internals; dependencies with known critical advisories (use the stack's audit command).
4. If the app has an AI feature: prompt injection paths, personal data sent to a model, missing human fallback, no spend cap.

Output: a table of findings ranked by severity with the smallest fix for each, then the list of checklist items you could not verify and why.
=====END FILE=====
=====FILE: .claude/commands/build.md=====
---
description: Do the next unticked task in the current phase, following workflows/04_build-task.md.
---
Follow `workflows/04_build-task.md` for the next unticked task in the current phase file. One task only. Close it out with the `/handoff` steps yourself.
=====END FILE=====
=====FILE: .claude/commands/debug.md=====
---
description: Structured debugging. Finds the root cause before changing code.
argument-hint: "[what is broken]"
---
Problem: $ARGUMENTS

Follow `workflows/05_debug.md`. Reproduce it yourself in the browser or terminal. Do not ask the owner for logs or screenshots. Do not change any code until you have stated: what is failing, why, which file is responsible, the smallest fix, and how the fix will be proven.
=====END FILE=====
=====FILE: .claude/commands/handoff.md=====
---
description: Close out a task. Claude runs these steps itself at the end of every task; the owner never needs to type this.
---
1. `node tools/check.mjs --fast`. If it fails, fix it, or record the failure honestly in STATE. Never report a red build as green.
2. Commit finished work on the phase branch and push. Describe anything unfinished in STATE.
3. Tick finished tasks in the phase file. Add tasks you discovered.
4. Rewrite `brain/05_STATE.md` from its template, under 60 lines, replacing old content.
5. Hard-to-reverse choice this session: add an ADR. Learned a tool quirk or limit: add it to STATE as a proposed workflow change.
6. Commit and push the brain changes.
7. If STATE lists proposed workflow changes, show each as a before/after with its reason and ask once whether to apply them.
8. Report to the owner, 8 lines at most, in precise technical language but no code: what now works, where to see it (localhost or live link), what changed structurally (tables, routes, services, jobs), what you verified and how, what happens next, and only if true, what you need from them with steps.
9. End with exactly: "Please type /clear and then type go."
=====END FILE=====
=====FILE: .claude/commands/plan-phase.md=====
---
description: Write the detailed task list for the next phase, just before it starts. Planning only, no code.
argument-hint: "[phase number]"
---
Plan phase $ARGUMENTS. Stay in plan mode. Write no application code.

1. Read `brain/01_PRD.md`, `brain/04_PLAN.md`, `brain/02_ARCHITECTURE.md` and the previous phase file if there is one.
2. Research before planning: if the phase touches any outside API, service or library the project has not used yet, send the `researcher` subagent first (docs, auth method, rate limits, pricing and free tier, that the endpoints you need exist). Plan from its brief, not from memory.
3. Feature brief: check the six build questions in `workflows/01_discovery.md` (source, output, trigger, accounts, success, edge cases) against the PRD for this phase. Collect every unanswered product question and ask them in one message, now, so the owner is not interrupted mid-build. Never ask engineering questions.
4. Create `brain/phases/P<N>-<name>.md` with: goal in one sentence, what is out of scope for this phase, the tasks, and the phase exit check.
5. Tasks are vertical slices a user could see working, not layers. Each task has: ID, goal, files likely touched, acceptance criteria written as observable behaviour, how it is tested, size S or M. Anything larger than M gets split. Aim for 3 to 8 tasks.
6. List what the owner must provide during this phase (keys, content, decisions) so they can prepare it in one go.
7. Tell the owner the plan the way you would brief a technical project lead: what a user can do at the end of the phase, the task breakdown, what changes structurally (data model, routes, integrations, jobs), the main risk, and what you need from them. Do not wait for approval unless the plan changes scope or cost. Start the first task in the next session.
=====END FILE=====
=====FILE: .claude/commands/review.md=====
---
description: Fresh-eyes review of the current branch with the reviewer subagent, plus the security auditor when the phase is sensitive.
---
1. Run the `reviewer` subagent on this branch.
2. If the diff touches auth, user data, payments, uploads, webhooks or an AI feature, also run `security-auditor`.
3. Fix blockers and should-fix items one at a time, re-running `node tools/check.mjs --fast` after each.
4. Mention to the owner only what changes what they will see or pay.
=====END FILE=====
=====FILE: .claude/commands/ship.md=====
---
description: Release the current phase end to end. Checks, visual QA, review, PR, preview verification, merge, production smoke test, rollback if needed.
---
Follow `workflows/07_release.md` from step 1 to step 13 without stopping for approval. Stop only if a step needs a login or key from the owner.
=====END FILE=====
=====FILE: .claude/commands/start.md=====
---
description: Continue the project from brain/05_STATE.md. Same as typing "go".
---
1. Read `brain/05_STATE.md` and the phase file it names. Nothing else yet.
2. `git status` and `git log --oneline -5`. If the tree is dirty or the branch does not match STATE, sort it out yourself before anything else.
3. Tell the owner in three lines where the project is and what you are doing now. Mention anything still waiting on them.
4. Start the task with `workflows/04_build-task.md`. Do not wait for permission.
=====END FILE=====
=====FILE: .claude/commands/status.md=====
---
description: Project status report for the owner, the way a delivery lead would want it. Read-only.
---
Produce a status report. Change nothing. Read `brain/04_PLAN.md`, `brain/05_STATE.md`, the current phase file, and run `git log --oneline -15`, `gh pr list`, `node tools/env-check.mjs`.

Report, in this order, no code:
1. **Where we are:** phase N of M, tasks done / total in this phase, what is live and where.
2. **Since last report:** what shipped, by PR.
3. **Next:** the next three tasks.
4. **Risks and debts:** known issues, anything failing, dependencies waiting to be updated.
5. **Waiting on you:** access items, open decisions, proposed workflow changes awaiting a yes.
6. **Running cost:** services in use and their current monthly cost from `brain/02_ARCHITECTURE.md` and the stack ADR. Say "not recorded" rather than guess.
7. **Scope check:** anything built or requested that is not in `brain/01_PRD.md`.
=====END FILE=====
=====FILE: .claude/rules/backend-data.md=====
---
paths:
  - "**/api/**"
  - "**/server/**"
  - "**/services/**"
  - "**/lib/**"
  - "supabase/**"
  - "**/migrations/**"
  - "**/*.sql"
  - "**/*.py"
---
# Backend and data rules

- Validate input at every trust boundary: request bodies, query params, webhooks, file uploads, anything from an LLM.
- Authorisation is checked on the server for every read and write. The client is never trusted to say who the user is.
- UI components do not talk to the database. Data access sits in one layer named in `brain/02_ARCHITECTURE.md`.
- Every schema change is a migration file in the repo. Migrations are reversible or come with a written rollback. Never edit a migration that has already run in the cloud.
- Every table holding user data has row-level access rules before it holds real data. Test that user A cannot read user B's rows.
- Anything that can take longer than about 2 seconds goes to a background job with a visible status, not a blocking request.
- Calls to outside services have a timeout, a retry policy where it is safe, and a handled failure path. Use an idempotency key when the same event could arrive twice.
- Read every required env var once at startup or at the top of the job, and fail immediately with the variable's name if it is missing. Never log the value. Third-party IDs (workspace, channel, list) are env vars too, not hardcoded and not looked up at runtime.
- Scheduled polling uses a lookback window slightly larger than the interval, with idempotency absorbing the overlap.
- Log events, never secrets or personal data.
=====END FILE=====
=====FILE: .claude/rules/frontend.md=====
---
paths:
  - "**/*.{tsx,jsx,vue,svelte,astro,html,css,scss}"
---
# Frontend rules

- Load the `frontend-design` skill before writing or restyling UI. Tokens, type and spacing come from `brain/03_DESIGN.md`. Do not invent colours or fonts.
- The mockups in `design/mockups/` are the target. Match them. Do not add sections or "improve" them.
- If `design/brand_assets/` has a logo, palette or images, use them. No placeholder where a real asset exists.
- Every screen ships with loading, empty, and error states, and works at 375, 768 and 1440 px.
- Every clickable element has hover, focus-visible and active states. Keyboard focus is always visible.
- Animate only `transform` and `opacity`. Never `transition: all`. Respect `prefers-reduced-motion`. One orchestrated motion moment per page at most.
- Verify visually with `workflows/10_visual-qa.md`: `node tools/visual-diff.mjs` must pass for every screen you touched, at every viewport. Name differences in pixels or hex, fix from the tokens, run again. Never raise a threshold to pass. The owner is never asked for a screenshot.
- Mark regions whose content changes between runs with `data-dynamic` so they can be masked.
- Copy is part of the design. Buttons say what happens ("Save changes"). Errors say what went wrong and how to fix it.
=====END FILE=====
=====FILE: .claude/rules/testing.md=====
---
paths:
  - "**/*.{test,spec}.*"
  - "tests/**"
  - "e2e/**"
---
# Testing rules

- `brain/08_TEST_PLAN.md` defines "working". A task is not done until its acceptance criteria are covered there and pass.
- Test behaviour a user would notice. Do not test implementation details or the framework.
- Each vertical slice gets one end-to-end test of its happy path and one test of its most likely failure.
- A bug fix starts with a failing test that reproduces the bug.
- Never weaken, skip or delete a failing test to get green. If the test is wrong, say why in the commit message.
- No test may depend on production data or a production key.
=====END FILE=====
=====FILE: .claude/rules/trigger-dev.md=====
---
paths:
  - "**/trigger/**"
  - "trigger.config.*"
---
# Trigger.dev rules (only when the stack ADR chose Trigger.dev for background jobs)

Proven gotchas. Confirm against the current docs with the `researcher` subagent when the SDK major version differs from 4.

- TypeScript only inside `src/trigger/`. All job code runs as Trigger.dev tasks, never as plain Node scripts. Use native `fetch`.
- One folder per automation: `src/trigger/<automation>/`. One file for simple jobs. Split into a light scheduled check task and a heavy per-item process task when a job polls for new items.
- Import from `@trigger.dev/sdk`. Never `client.defineJob` (v2 syntax, breaks everything). Use `task()`, `schedules.task()` with a `cron` string, or `schemaTask()`.
- Imports between task files need the `.js` extension: `import { processItem } from "./process-item.js"`.
- `triggerAndWait()` returns a Result. Check `result.ok` before `result.output`, or use `.unwrap()`.
- Never wrap `triggerAndWait`, `batchTriggerAndWait` or `wait.*` in `Promise.all`.
- Use an `idempotencyKey` whenever the same item could be triggered twice, for example `item-<id>` when polling.
- Polling on a schedule: make the lookback window slightly larger than the cron interval (25 hours for a daily job) so nothing is missed at the boundary. The idempotency key absorbs the overlap.
- Waits over 5 seconds are checkpointed and do not count as compute.
- Validate every env var at the top of every task and fail with its name: `if (!apiKey) throw new Error("MY_API_KEY is not set")`. Never log the value.
- Third-party IDs (workspace, channel, list) come from env vars too. Do not hardcode them or look them up at runtime when a static value will do.
- The frequency of a scheduled job is a product decision. It is asked once in the feature brief, never guessed.
- Every env var must exist in the Trigger.dev project for each environment, not just locally. Missing dashboard env is the most common production failure.
- When adopted: add the Trigger.dev MCP server to `.mcp.json` (`npx trigger.dev@<pinned version> mcp`) and use it to fire test runs, wait for them, and read run logs. Deploys go through the release workflow (CI on merge), not ad hoc.
- After a deploy: confirm the first run succeeded, confirm the schedule is registered, fire one manual test run.
- When a run fails, check in this order: env var missing in the dashboard, import path without `.js`, API auth (wrong key format, expired key, wrong header name).
=====END FILE=====
=====FILE: .claude/settings.json=====
{
  "env": {
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "200000"
  },
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(gh:*)",
      "Bash(node:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(pnpm:*)",
      "Bash(supabase:*)",
      "Bash(vercel:*)",
      "Bash(docker:*)",
      "Bash(python3:*)",
      "Bash(pip:*)",
      "Bash(claude plugin:*)",
      "Bash(claude mcp:*)"
    ],
    "ask": [
      "Edit(./workflows/**)",
      "Write(./workflows/**)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.local)",
      "Read(./.env.development)",
      "Read(./.env.production)",
      "Read(./.env.production.local)",
      "Read(./.env.*.local)",
      "Read(./**/*.pem)",
      "Read(./credentials.json)",
      "Read(./token.json)"
    ]
  },
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node tools/session-brief.mjs"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/guard.mjs"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node tools/stop-check.mjs"
          }
        ]
      }
    ]
  },
  "enabledPlugins": {
    "security-guidance@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true,
    "github@claude-plugins-official": true
  }
}
=====END FILE=====
=====FILE: .claude/skills/frontend-design/SKILL.md=====
---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---

# Frontend Design

Approach this as the design lead at a design studio known for giving every client a distinct visual identity that is not mistaken for anyone else's. This client has already rejected proposals that felt cliché or templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take aesthetic risk if justified.

## Ground your designs in the subject matter

If the brief does not identify what the product or subject matter is, identify it yourself before designing, and confirm with the client. You can come up with one concrete subject, the design's audience, and the design's primary job, as a proposal. If there's any information in your memory about the client's preferences or context about what they're building, use that as a hint. The subject's industry, subject matter, materials, and vernacular are where distinctive visual choices come from — a design for a toy for girls aged 8–11 will be very aesthetically different from a dashboard for financial analysts. Build with the brief's real content and subject matter throughout.

## Design principles

For web designs, the hero is the first thing viewers will see. Open with the most characteristic thing in the subject's world, in the form that is most appropriate: a headline, an image, an animation, a live demo, an interactive moment, or other treatments. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the default treatment, so only use it if that's truly the best option.

Typography carries the personality of the page. You don't need a different typeface for display or headline text and body content: use one family or two, and if two, make them clearly distinct.

Choose your typefaces deliberately, not the default families you would reach for on any other project, and set a clear type scale following the default guidance of The Elements of Typographic Style with intentional weights, widths, and spacing. When type is used as a headline or visual element, use the type treatment itself as an active part of the design, not a neutral delivery vehicle for the content.

Default to line lengths of less than 80 characters. Serif typefaces can have slightly longer line lengths; give serif body text slightly more line-height than a sans-serif.

Avoid these default typographic treatments; they are the commonest tells of a generated page:
- Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color.
- Using all caps for labels.
- Adding unnecessary typographic labels above content.

Visual structure is information. Structural devices like outlines, borders, numbering, eyebrows, dividers, labels, etc., encode useful information about the content rather than decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a stepped process or a timeline. Before adding numbered markers, check the content really is a sequence.

Use non-user-triggered motion sparingly and deliberately, only to draw attention. A single orchestrated moment — one page-load sequence or one reveal — lands better than scattered effects; fade-and-slide-up entrances on each section and hover transitions on every card are the generic default and read as AI-generated. Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy and placeholder content. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: plan, review against the brief, build, critique

For calibration, AI-generated design right now clusters around some traits:
1. a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta or warm-clay accent (often near #D97757 — Anthropic's own Claude-interaction accent, so on a user's brief it reads as a tell);
2. a near-black background with a single bright acid-green or vermilion accent;
3. a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns;
4. the SaaS-card kit: content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration;
5. template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow label above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em dash; tinted near-black (#0B0B0B, #111) standing in for black; a monospace face for small data labels; a '→' appended to link and button text.

All traits are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. As with a hired human designer, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

Work in two passes. First, brainstorm a short design plan based on the client's design brief: create a compact token system with color, type, layout, and principles.
- Color: describe the core base palette as 4–6 named hex values.
- Type: the typefaces and their roles.
- Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Include alignment guidance; should the content be left aligned, center aligned, justified?
- Principles: the high-level guidance for what makes this page unique.

Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and an element-based selector like .cta). This can happen often with padding/margin between sections.

## Restraint and self-critique

Spend your boldness in one place. Let one element be the memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected, visually accessible, harmonious color palettes. Critique your own work as you build, taking screenshots to review if your environment supports it — a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creatives have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

## More on writing in design

Words appear in a design for one reason: to make it easier to understand and use. They are design content, not decoration. Bring the same intentionality and minimalism to copywriting that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's perspective. Name things by what users will understand in simple language, not by how the system is built. A user manages notifications, not webhook config. Describe what something is or does in plain terms rather than selling it. Being specific and legible to new users is always better than being clever.

Use active voice as default. A CTA says exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the tone conversational: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each written element do exactly one job.
=====END FILE=====
=====FILE: .DS_Store=====
   Bud1           
                                                           u d elg1Sco                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           . c l a u d elg1Scomp      g     . c l a u d emoDDblob      V�/�A    . c l a u d emodDblob      V�/�A    . c l a u d eph1Scomp     0     . g i t h u blg1Scomp      �    . g i t h u bmoDDblob      V�/�A    . g i t h u bmodDblob      V�/�A    . g i t h u bph1Scomp            b r a i nlg1Scomp      6�    b r a i nmoDDblob      V�/�A    b r a i nmodDblob      V�/�A    b r a i nph1Scomp      �     d e s i g nlg1Scomp            d e s i g nmoDDblob      V�/�A    d e s i g nmodDblob      V�/�A    d e s i g nph1Scomp            t o o l slg1Scomp      _i    t o o l smoDDblob      V�/�A    t o o l smodDblob      V�/�A    t o o l sph1Scomp      �    	 w o r k f l o w slg1Scomp      ��   	 w o r k f l o w smoDDblob      V�/�A   	 w o r k f l o w smodDblob      V�/�A   	 w o r k f l o w sph1Scomp      �                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           @      �                                        @      �                                          @      �                                          @                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   E  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       DSDB                                 `          �                                         @      �                                          @      �                                          @                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
=====END FILE=====
=====FILE: .env.example=====
# Names only. Real values go in .env.local (your computer) and .env.production.local (the live site).
# Both files are gitignored. tools/env-push.mjs sends the live values to the host. Nobody pastes keys in chat.
# Rule: every variable the code reads must be listed here with a comment saying where to get it.
# Add "# optional" after the = for variables the app can run without.
# Verify with: node tools/env-check.mjs

# --- app
APP_URL=                      # http://localhost:3000 locally; the real domain in production

# --- alerts (workflows/08_add-service.md)
SLACK_WEBHOOK_URL= # optional  Slack > Apps > Incoming Webhooks > copy URL

# --- added by Claude when a service is adopted (examples, keep commented until used)
# SUPABASE_URL=               # Supabase dashboard > Project Settings > API
# SUPABASE_PUBLISHABLE_KEY=   # safe for the browser
# SUPABASE_SECRET_KEY=        # server only. Never give this a browser-exposed prefix
# RESEND_API_KEY=             # resend.com > API Keys
# MODAL_TOKEN_ID=             # modal.com > Settings > API Tokens
# MODAL_TOKEN_SECRET=
# SENTRY_DSN= # optional
=====END FILE=====
=====FILE: .github/dependabot.yml=====
# Weekly, grouped dependency updates. Claude merges the green ones at the start of each release (workflows/07_release.md).
# Add the app's ecosystem (npm, pip, ...) and directory once the stack is chosen in workflows/02_stack-selection.md.
version: 2
updates:
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule: { interval: "weekly" }
  - package-ecosystem: "npm"
    directory: "/tools"
    schedule: { interval: "weekly" }
    groups:
      tools: { patterns: ["*"] }
=====END FILE=====
=====FILE: .github/workflows/ci.yml=====
name: ci
on:
  pull_request:
  push:
    branches: [main]

jobs:
  guard:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Secret scan
        run: node tools/secret-scan.mjs

  # checks:
  #   Added by workflows/02_stack-selection.md once the stack is chosen.
  #   It installs dependencies, then runs: node tools/check.mjs
  #   CI uses test values only. Never add production secrets to CI.
=====END FILE=====
=====FILE: .gitignore=====
# secrets - never commit
.env
.env.*
!.env.example
*.pem
credentials.json
token.json

# personal Claude Code settings
.claude/settings.local.json
CLAUDE.local.md

# disposable
.tmp/
*.log
.DS_Store
Thumbs.db

# dependencies and build output (all common stacks)
node_modules/
.next/
dist/
build/
out/
.vercel/
.turbo/
coverage/
playwright-report/
test-results/
__pycache__/
.venv/
*.pyc
supabase/.temp/
supabase/.branches/
=====END FILE=====
=====FILE: .mcp.json=====
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
=====END FILE=====
=====FILE: brain/00_INDEX.md=====
# Brain index

Everything the project knows lives here, in git. Read only what the task needs.

| Question | File | Read when |
|---|---|---|
| Where are we, what is next? | `05_STATE.md` | start of every session |
| What is the current task list? | `phases/P<N>-*.md` | start of every session |
| What are we building, for whom, what is out of scope? | `01_PRD.md` | planning, any scope doubt |
| What stack, which folders, how data flows? | `02_ARCHITECTURE.md` | planning, new module, new table |
| How should it look, feel and read? | `03_DESIGN.md` + `../design/mockups/` + `../design/visual.json` | any UI work |
| What are the phases? | `04_PLAN.md` | planning a phase |
| Why did we choose X? May I change it? | `06_DECISIONS.md` | before proposing any change of direction |
| What must be true for this to be safe? | `07_SECURITY.md` | auth, data, uploads, webhooks, AI, pre-launch |
| What does "working" mean? | `08_TEST_PLAN.md` | writing tests, phase exit |
| How do we run, deploy, roll back, get alerted? | `09_RUNBOOK.md` | environments, release, incident |

Rules for these files
- `05_STATE.md` is rewritten every handoff and stays under 60 lines. `06_DECISIONS.md` is append-only. The rest change only when reality changes, in the same commit as the code that changed it.
- A document that describes an app that no longer exists is worse than no document. If you notice drift, fix the doc in that session.
- Deep specs (data model, API contract, scraping, payments, AI feature) start as sections of `02_ARCHITECTURE.md`. Split one into its own numbered file only when its section passes about 80 lines, and add it to this table.
- What the agent has learned about tools, limits and quirks is not here. Approved lessons live under `## Learned` in the workflow they belong to. Lessons waiting for the owner's yes sit in `05_STATE.md` (`workflows/README.md` explains the loop).
- There is no changelog file. `git log` with conventional commits is the changelog.
=====END FILE=====
=====FILE: brain/01_PRD.md=====
# Product requirements

> Written in workflows/01_discovery.md from the owner's answers. Owner's words where possible. One page.

## Problem
<!-- Who hurts, how, how often. One paragraph. -->

## User
<!-- One primary user. What they do today instead. -->

## Outcome
<!-- The one thing the user can do after using this that they could not do before. -->

## MVP scope
<!-- 3 to 6 capabilities, each phrased as "A user can ...". -->

## Out of scope for v1
<!-- As important as the scope. This list is what stops the project growing on its own. -->

## Success criteria
<!-- Numbered, observable. "A signed-up user can create, edit and delete a note and see it after refresh." -->

## Constraints
<!-- Budget per month, deadline, devices, languages, legal or data-residency needs, accounts the owner already has. -->

## Open questions
<!-- Anything unanswered. Empty before Phase 2 starts. -->
=====END FILE=====
=====FILE: brain/02_ARCHITECTURE.md=====
# Architecture

> Written in workflows/02_stack-selection.md. Every choice here has an ADR in 06_DECISIONS.md.

## Stack
| Layer | Choice | Why this, for this PRD | Swap path |
|---|---|---|---|
| Frontend | | | |
| Backend / API | | | |
| Database | | | |
| Auth | | | |
| File storage | | | |
| Background jobs / heavy compute | | | |
| Email | | | |
| Hosting | | | |
| Errors and alerts | | | |

## Components and request flow
<!-- A mermaid flowchart (renders on GitHub): user → UI → server → data → outside services. Keep it current; the owner reads this instead of the code. -->

## Data model
<!-- A mermaid erDiagram of the tables and relations, updated in the same commit as any migration. -->

## Folder layout
<!-- The real tree of the app code, and one line on what belongs in each folder. -->

## Boundaries
<!-- e.g. UI never queries the database directly. All database access goes through <folder>. Secrets are server-only. -->

## Data model
<!-- Tables or collections, key fields, relations, who may read and write each. -->

## Outside services
<!-- For each: what it is used for, env var names, free-tier limit that matters, what happens when it is down. -->

## AI features (delete if none)
<!-- First question: does this need an LLM, or does a rule, query or existing API do it? -->
For each AI feature record: how it can fail, cost per run, latency budget, what "correct" means and how it is checked, and the path for a human when it is wrong.
=====END FILE=====
=====FILE: brain/03_DESIGN.md=====
# Design system

> Written in workflows/03_design-first.md from the reference mockups in design/mockups/.
> These tokens are the only source of colour, type and spacing. If a value is not here, add it here first.

## Subject and audience
<!-- What this product is, who looks at it, what the page must make them do. -->

## Principles
<!-- 3 lines. What makes this product look like itself and nobody else. The one bold thing, and what stays quiet around it. -->

## Colour
<!-- 4 to 6 named hex values with roles: background, surface, text, muted, accent, danger. Contrast checked at AA. -->

## Type
<!-- Families and roles, the scale in px or rem, weights, line-heights. Body line length under 80 characters. -->

## Space, radius, elevation
<!-- The spacing steps in use. Radius by role, not one value everywhere. The layer system: base, raised, floating. -->

## Components
<!-- Button (primary, secondary, destructive), input, card, nav, modal, toast, table. Each with its states. -->

## States every screen needs
Loading, empty, error, success. Mobile 375, tablet 768, desktop 1440.

## Motion
<!-- The one orchestrated moment, if any. Easing and duration. Reduced-motion behaviour. -->

## Voice
<!-- Sentence case. Plain verbs. How errors and empty screens talk. Three example strings. -->

## Screens
<!-- Each mockup in design/mockups/, the route it is the target for, and its entry in design/visual.json. -->
=====END FILE=====
=====FILE: brain/04_PLAN.md=====
# Plan

> Phases only. Task detail is written just before a phase starts with /plan-phase, into phases/P<N>-<name>.md.
> Each phase ends in something the owner can click on a preview URL.

| # | Phase | Ends when the owner can... | Status |
|---|---|---|---|
| 0 | Bootstrap | see the repo on GitHub with checks passing | |
| 1 | Discovery | read a one-page PRD and say "yes, that" | |
| 2 | Stack and architecture | approve the stack, its monthly cost and what they must sign up for | |
| 3 | Design first | point at 3 to 5 screens and say "build these" | |
| 4 | Foundation | open the live URL, sign up, log in, and see an empty home screen that matches the design | |
| 5+ | Feature slices (one row per slice) | | |
| N-1 | Hardening | read a clean security and test report | |
| N | Launch | use the production URL, and receive an alert when something breaks | |

## Rules
- A phase is 3 to 8 tasks. A task fits in one session.
- Slices are vertical: UI, server, data and test for one user flow, working end to end.
- No phase starts until the previous one is released and its production smoke test passed.
=====END FILE=====
=====FILE: brain/05_STATE.md=====
# State

> Rewritten at every /handoff. Under 60 lines. A new session must be able to continue from this file alone.

**Updated:** <!-- date, and which task was just finished -->
**Phase:** 0 Bootstrap → file: `workflows/00_bootstrap.md`
**Branch:** main
**Build status:** <!-- result of node tools/check.mjs --fast -->

## Next action
<!-- One sentence. The exact thing the next session does first. -->
Run workflows/00_bootstrap.md.

## Done this phase
-

## In progress / uncommitted
<!-- What is half-done, which files, what is left. "None" if clean. -->

## Known issues
<!-- Bugs and debts not being fixed right now, with file names. -->

## Waiting on the owner
<!-- Only access items: a login, a key (with the variable name and file it goes in), DNS, a card. "Nothing" if nothing. -->

## Proposed workflow changes (need the owner's yes)
<!-- One entry per proposal: file, the exact line to add or change, why, date. Removed once approved and applied, or declined. "None" if none. -->

## Watch out
<!-- Traps the next session should not fall into: things tried that did not work, quirks of a tool. -->
=====END FILE=====
=====FILE: brain/06_DECISIONS.md=====
# Decisions

> Append-only. Binding. To change a decision, add a new entry that supersedes the old one, and get the owner's yes.
> Log a decision when it is hard to reverse or when a future session might be tempted to "fix" it.

## ADR-000: Project operating model
- **Date:** <!-- bootstrap date -->
- **Decision:** Claude runs all engineering end to end, including git, database, hosting, email setup, releases and rollbacks. The owner supplies access (accounts, logins, keys, DNS, card), three product decisions (PRD, architecture and cost, design direction), approval of every change to `workflows/`, and any scope or spending change. Work is local first, then phase branch → PR → CI → preview verified by Claude → merge → production smoke test. All project knowledge lives in `brain/`. Secrets live in gitignored env files and never enter the repo or the chat.
- **Because:** The owner understands systems and process but has never written code, so they will not review code. Code-level safety therefore comes from scripts, hooks, CI, visual diffs and rollback. They can and do review architecture, scope and process, which is why workflows change only with their approval and hard-to-reverse choices are written as ADRs.
- **Would reverse if:** A developer joins who should review PRs, or the app holds data where a human sign-off on releases is required.

<!-- Template
## ADR-00N: <title>
- **Date:**
- **Decision:**
- **Options considered:** (with the reason each lost)
- **Because:**
- **Cost:** money per month at expected usage, and the free-tier limit that would be hit first
- **Swap path:** what it takes to move off this later
- **Would reverse if:**
- **Supersedes:** ADR-00X (if any)
-->
=====END FILE=====
=====FILE: brain/07_SECURITY.md=====
# Security baseline

> Built in from Phase 4, audited by the security-auditor subagent before launch. Mark N/A with a reason rather than deleting a line.

## Secrets
- [ ] No secret in git, logs, client bundles, error messages or chat. `node tools/secret-scan.mjs` is clean.
- [ ] Browser-exposed variables contain only values safe for the public.
- [ ] Separate keys for local, preview and production. A leaked key is rotated the same day and the rotation is noted in the runbook.

## Identity and access
- [ ] Every private route, server action and API endpoint checks the session on the server.
- [ ] Every read and write checks ownership. Tested: user A cannot read or change user B's data.
- [ ] Row-level rules are on for every table with user data. No table is open by default.
- [ ] Admin or service-role credentials are used only in server code, never shipped to the browser.

## Input and output
- [ ] All input is validated at the server boundary with a schema.
- [ ] No string-built SQL. No user input reaches a shell, `eval`, or raw HTML.
- [ ] File uploads check type, size and name, and are stored outside the web root.
- [ ] Webhooks verify the sender's signature and are safe to receive twice.
- [ ] Errors shown to users contain no stack traces, keys or internal paths.

## Abuse and cost
- [ ] Rate limits on sign-up, login, password reset, and anything that sends email or calls a paid API.
- [ ] Spend caps or alerts set on every paid service.

## Data
- [ ] Personal data collected is listed here, with why and where it is stored: <!-- list -->
- [ ] Backups exist and a restore has been tried once.
- [ ] Account and data deletion is possible.

## AI features (N/A if none)
- [ ] User text cannot override system instructions to reach data or tools it should not.
- [ ] Personal data sent to a model is listed above and the owner has accepted it in writing.
- [ ] Output is checked before it is trusted. A human fallback path exists. A per-user and per-day spend cap exists.

## Dependencies
- [ ] Dev-only tooling (review toolbar, debug panels, seed scripts) is absent from the production bundle. Checked by building for production and searching the output.
- [ ] The stack's audit command shows no critical advisories. Lockfile committed.
=====END FILE=====
=====FILE: brain/08_TEST_PLAN.md=====
# Test plan

> "Working" is defined here before it is built. Each phase adds its flows.

## Levels in use
<!-- Filled in at stack selection: unit runner, end-to-end runner, how to run each. -->

## Critical flows (end-to-end, run before every PR)
<!-- One per line: numbered steps a user takes, and what they must see. Start with sign up → log in → core action → refresh → log out. -->

## Must-fail cases
<!-- Logged-out user opens a private URL. User A requests user B's record by ID. Invalid form input. Expired session. Outside service is down. -->

## Visual checks
`node tools/visual-diff.mjs` passes for every screen in `design/visual.json` (design and regression). 768 px and a keyboard-only pass are checked by hand with chrome-devtools.

## Production smoke test (after every release, on the live URL)
<!-- 5 steps, under 3 minutes, no test data left behind. -->
=====END FILE=====
=====FILE: brain/09_RUNBOOK.md=====
# Runbook

## Environments
| | Local | Preview | Production |
|---|---|---|---|
| Where | this machine | one URL per pull request | `main` branch |
| Database | <!-- local --> | <!-- staging --> | <!-- production --> |
| Env values live in | `.env.local` | host, Preview scope (sent by `tools/env-push.mjs` from `.env.production.local`) | host, Production scope (same tool) |
| Who deploys | Claude | automatic on push to a PR | automatic when Claude merges the PR after verifying the preview |
| Real user data | never | never | yes |

## Run it locally
<!-- Exact commands, in order, from a fresh clone. -->

## Release
See `workflows/07_release.md`.

## Roll back
<!-- The exact clicks or command to put the previous production deploy back. How to reverse the last migration. Tried once before launch. -->

## Alerts
<!-- What posts to Slack: failed deploy, server error spike, failed scheduled job, spend threshold. Who reads it. -->

## Accounts
<!-- Service, owner's login email (never passwords), plan, renewal date, where the bill shows up. -->

## Incidents
<!-- Date, what users saw, cause, fix, what changed so it cannot repeat. -->
=====END FILE=====
=====FILE: brain/phases/.gitkeep=====

=====END FILE=====
=====FILE: design/baselines/.gitkeep=====

=====END FILE=====
=====FILE: design/brand_assets/.gitkeep=====

=====END FILE=====
=====FILE: design/mockups/.gitkeep=====

=====END FILE=====
=====FILE: PLAYBOOK.md=====
# The Playbook: building an app with Claude Code, from empty folder to live

For someone new to building with Claude Code who knows how software is delivered but has never written it: project and delivery managers, analysts, solution and pre-sales people, founders from the IT side. You know what an API, a schema, a staging environment and a release are. You do not want to learn syntax. Assumes a Claude Max plan.

Claude Code does all the engineering: code, terminal, git, database, hosting, email setup, testing, debugging, releases. You do four things: describe the product, make three decisions, approve changes to the working procedures, and hand over access (logins and keys) when asked.

Read sections 1 to 4 once. The rest is reference.

---

## 1. How this works

Three things go wrong when people who do not code build with AI. The agent forgets what was decided and rebuilds it differently. The project grows beyond the idea. Something broken or unsafe goes live. You already know the cure from delivery work: written scope, a repeatable process, gates before release, and a decision log. This setup gives the agent exactly those, and enforces them with scripts and hooks, because you will not be reading the code.

```
You                    product · 3 decisions · workflow approvals · logins and keys
   │
CLAUDE.md              under 50 lines, loaded every session: the loop and the rules
brain/                 the project's memory, in git: what, how, look, plan, state, why
workflows/   (W)       step-by-step procedures for each kind of work
Claude       (A)       reads the procedure, decides, runs tools, fixes its own errors
tools/       (T)       small scripts that do exact jobs the same way every time
.claude/               hooks that keep the memory current and block dangerous commands
   │
local  →  preview  →  live           Claude tests each stage in a real browser itself
```

Two habits are built into every task. **Order of work:** understand, research, clarify product questions, plan in plain English, build, set up settings, test locally, deploy, verify live. **Self-improvement:** when something fails, Claude fixes it, proves the fix, and proposes a change to the procedure it belongs to. You approve it, and the same mistake does not come back in a later session. Procedures never change behind your back.

The chat is not where the project lives. Everything that matters is written to files. That is why clearing the chat loses nothing.

---

## 2. One-time machine setup (about 30 minutes)

Accounts to create now: **Claude (Max plan)** and **GitHub** (free). Everything else (database, hosting, email, alerts) is created later, only if needed, with Claude giving you the exact clicks.

Install:
1. Git: git-scm.com
2. Node.js LTS, version 20 or newer: nodejs.org
3. GitHub CLI: cli.github.com
4. Google Chrome
5. Claude Code. Mac or Linux: `curl -fsSL https://claude.ai/install.sh | bash`. Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`. If that fails, use the current command at code.claude.com/docs/en/setup. Run `claude` once and log in.
6. Optional: Docker Desktop. Claude will tell you if the chosen stack benefits from it.

If any of these is missing, Claude notices during setup and walks you through it.

---

## 3. Start a project (10 minutes)

1. Make a new empty folder named after your project. No spaces.
2. Save the bootstrap file into it, named exactly `CLAUDE.md`.
3. Open a terminal in that folder and run `claude`. Say yes when it asks whether you trust the folder.
4. Type `go`.
5. Claude unpacks the whole project structure from that one file, replaces the big file with a short one, checks your machine, creates a private GitHub repo, and installs its plugins and browser tooling. It asks you for a project name and, if needed, a GitHub login.
6. When it says so, quit Claude Code, open it again in the same folder, approve the `chrome-devtools` server if asked, and type `go`. Claude now interviews you about your idea, one plain question at a time.

---

## 4. The phases

| # | Phase | What Claude does | What you do |
|---|---|---|---|
| 0 | Bootstrap | Machine check, repo, guards, plugins, browser tooling | Name it. Log in to GitHub. |
| 1 | Discovery | Interviews you, looks at 2 or 3 alternatives, writes a one-page PRD | Answer 6 to 10 questions. **Decision 1:** "yes, that is what I want." |
| 2 | Stack and architecture | Picks the technology that fits, verifies today's prices and limits, writes the architecture and reasons | **Decision 2:** approve one summary with the monthly cost. Then one sitting of sign-ups, logins and keys, with exact steps. |
| 3 | Design first | Proposes two visual directions, then builds browser-renderable reference mockups and the design system | Share a logo or references if you have them. **Decision 3:** pick a direction. |
| 4 | Foundation | Project skeleton, database, sign-up and login, CI, first live deploy | Nothing, unless a key is missing. |
| 5+ | Feature slices | One complete user flow at a time: screen, server, data, tests, visual check, release | Nothing. Try the link when Claude reports. |
| N-1 | Hardening | Security audit, two-account test, accessibility, performance, full test pass | Set spend alerts where only your dashboard can. |
| N | Launch | Domain, email domain, error tracking, alerts, backup and rollback drill | Buy the domain. Paste DNS records if your registrar is outside Claude's reach. |

Design comes before code so that every later session has a rendered reference to match instead of inventing a look. Work is done in slices ("sign up, create a note, see it after refresh") because a finished slice can be tested and released today.

---

## 5. What is in the repo

```
CLAUDE.md                 the rules Claude reads every session (short on purpose)
.env.example              names of settings the app needs. Never values.
.mcp.json                 live browser control for Claude (chrome-devtools)
brain/
  00_INDEX.md             which file answers which question
  01_PRD.md               what we are building, for whom, and what we are NOT building
  02_ARCHITECTURE.md      stack, folders, data model, outside services
  03_DESIGN.md            colours, type, components, motion, voice
  04_PLAN.md              the phases
  05_STATE.md             where we are right now and the next action
  06_DECISIONS.md         every hard-to-reverse choice and why. Binding.
  07_SECURITY.md          the safety checklist
  08_TEST_PLAN.md         what "working" means
  09_RUNBOOK.md           how to run, release, roll back, get alerted
  phases/                 detailed task list per phase, written just before it starts
workflows/                README (how workflows, agent and tools fit, and the self-improvement loop)
                          _TEMPLATE (for new workflows this project needs)
                          00 bootstrap · 01 discovery · 02 stack · 03 design · 04 build
                          05 debug · 06 security · 07 release · 08 add a service
                          09 session hygiene · 10 visual QA
tools/                    preflight · env-check · env-push · secret-scan · check
                          visual-diff · guard · session-brief · stop-check · notify-slack
.claude/
  settings.json           permissions, blocked file reads, hooks, plugins, context cap
  commands/               /start /build /handoff /plan-phase /debug /review /ship /status
  agents/                 researcher · reviewer · security-auditor
  rules/                  frontend, backend-data, testing, trigger-dev. Loaded only when matching files are touched.
  skills/frontend-design/ the design skill, stored in the repo so it is always there
design/
  brand_assets/           your logo, colours, photos
  mockups/                the approved design as web pages a browser can render
  visual.json             which screen is compared with which mockup
  baselines/              screenshots of finished screens, so later work cannot break them
.github/workflows/ci.yml  checks that run on every pull request
```

The app's own code goes wherever the chosen stack puts it. Claude records that layout in `brain/02_ARCHITECTURE.md`.

---

## 6. Who does what

**Claude does, without asking:** all code, all terminal commands, git branches, commits, pushes, pull requests and merges, database tables and migrations, hosting configuration and deploys, email service setup, tests, debugging, visual checks, security review, rollbacks. It chooses languages, frameworks, libraries and services, researches current docs and prices first, and writes down why.

**You are asked only for:**
- **Access.** Creating an account, logging in a tool, generating an API key, DNS at your registrar, entering a card. Claude gives click-by-click steps and tells you which file and which name each key goes under.
- **Three decisions.** Yes to the PRD. Yes to the architecture-and-cost summary (components, data, auth, deploy path, rejected alternatives, swap paths). The design direction.
- **Workflow changes.** The files in `workflows/` are your process. Claude proposes changes (a lesson learned, a tightened step, a new procedure) as a before/after with a reason, batched at the end of a task. You say yes, no, or edit. Claude Code also shows its own confirmation when it touches that folder.
- **Scope or money.** A feature that is not in the PRD, or anything that starts costing money.

If Claude asks you to pick a library, read code or run commands, answer: "You decide." Architecture, data model and process questions are fair, and rare.

**What you can read without coding:** `brain/01_PRD.md` (scope), `brain/02_ARCHITECTURE.md` (components and data), `brain/06_DECISIONS.md` (ADRs), `brain/04_PLAN.md` and the phase files (work breakdown), `brain/05_STATE.md` (status), every file in `workflows/` (process), and the pull requests on GitHub (CI results and change summaries).

**What keeps this safe without you:** a guard script blocks force-pushes, pushes straight to `main`, skipping CI, production deploys that bypass the pull request, cloud database resets, and reading secret files. Every release goes through automated checks and a browser test of the preview before Claude merges, and a smoke test of the live site after. If the smoke test fails, Claude rolls back first. Once your app has real users, Claude backs up before any change that could lose data.

---

## 7. Your rhythm, and how drift is prevented

```
you type:     go
Claude:       reads the saved state → does one task → tests it in the browser → commits, pushes
              → updates the saved state → tells you what now works
Claude says:  "Please type /clear and then type go."
you type:     /clear      then      go
```

That is all you need to remember, and Claude reminds you every time. Type `/status` whenever you want a delivery-style report: progress, risks, what is waiting on you, running cost, scope check. Behind it:

| Risk | What handles it |
|---|---|
| A new chat not knowing the project | A start hook prints `brain/05_STATE.md` into every new, cleared or compacted session |
| The saved state going stale | A stop hook refuses to let Claude end a turn while project files are newer than the state file |
| A chat getting too long (quality drops, cost rises) | The same hook measures the conversation and, past about 120k tokens, makes Claude wrap up and ask you to `/clear` |
| You ignoring the `/clear` request | Context is capped at 200k tokens in settings. After the automatic tidy-up, the state is printed again, so the project stays aligned anyway |
| Claude proposing something already ruled out | `brain/06_DECISIONS.md` is binding and the reviewer subagent checks against it |
| Same bug "fixed" twice | Rule: second failure ends the session; the next one starts clean with the evidence |
| Invented functions or packages | Rule: check the installed package or official docs first. The language-server plugin flags unknown symbols on edit |
| The look drifting | Pixel comparison against the mockups, and against each finished screen's own baseline |
| The process changing without you knowing | Edits under `workflows/` are on Claude Code's ask list, shell writes to that folder are blocked, and proposals wait in the state file until you answer |
| The project growing | The out-of-scope list in the PRD. A request outside it is one of the few questions you get |

Why not "clear at 75 to 80 percent full": current models hold up to a million tokens and by default only tidy up near the end of that. Quality and cost degrade far earlier, because every message re-sends the whole conversation. So the boundary is the task, with a hard cap as the backstop.

Bad day? Everything is in git. Say: "Put the project back to the last release that passed its smoke test."

---

## 8. Models and cost (Max plan)

- Leave the model alone. On Max the default is Opus, with the large context window included. Claude plans, builds and debugs on it.
- Research, review and security audit run as subagents on Sonnet, in their own context, returning only conclusions. This keeps the main conversation small and saves your limit for building.
- `fable` is the most capable model, but depending on plan it can bill usage credits on top of your subscription. The model picker says "Requires usage credits" when it does. Do not switch to it unless you mean to.
- Do not change effort settings. If Claude is stuck on something hard, it will use deeper reasoning on its own.
- What actually controls usage is short sessions, a small `CLAUDE.md`, and scripts that return numbers instead of loading screenshots and logs into the chat. All three are built in.
- `/usage` shows what is consuming your limit.

---

## 9. Environments and secrets

| | Local | Preview | Live |
|---|---|---|---|
| Where | your computer | one URL per pull request | the real site |
| Who deploys | Claude | automatic | automatic when Claude merges |
| Real users' data | never | never | yes |
| Settings come from | `.env.local` | sent by `tools/env-push.mjs` | sent by `tools/env-push.mjs` |

**Local first, with a live browser.** Claude runs the app on your machine and gives you a `http://localhost` address you can open any time. It tests the same app itself in Chrome: clicks through the flows, reads the console and network tab, compares screens with the design. You never have to describe a screen, copy an error or send a screenshot.

**Secrets**
- A secret is any key, token or password. Keys live in two files on your computer: `.env.local` (for local) and `.env.production.local` (for the live site). Both are ignored by git, so they never reach GitHub.
- When a key is needed, Claude tells you where to click to create it and the exact name to paste it under. You paste it in the file, in your editor. Never in the chat. If you slip, revoke that key and make a new one.
- Claude is blocked from reading those files. `tools/env-check.mjs` tells it which names are filled in. `tools/env-push.mjs` copies the live values to the hosting provider. The scripts touch the values; Claude only sees names.
- `tools/secret-scan.mjs` runs before every check and on every pull request.

---

## 10. The services menu

Claude picks from these when the PRD calls for them, and may choose something else with a written reason.

| Need | Default | What you do once | What Claude does |
|---|---|---|---|
| Code, history, CI | GitHub | `gh auth login` | everything else |
| Database, login, file storage | Supabase | sign up, `supabase login` | project, tables, migrations, access rules, auth settings |
| Hosting with a preview per pull request | Vercel | sign up with GitHub, `vercel login` | link, settings, deploys, domains, rollbacks |
| Transactional email | Resend | create one API key | sending domain, DNS records, templates, test sends |
| Long jobs, Python, heavy compute | Modal, or a TypeScript job platform | one token, only if needed | the rest |
| Alerts | Slack incoming webhook | create one webhook URL | wiring and messages |
| Error tracking | Sentry | create a project before launch | the rest |

Prices and free-tier limits change. Claude looks them up on the day and shows you the number before you sign up.

---

## 11. Testing, visual QA and debugging

- After every task: secret scan, lint, types, tests. Before every release: the same plus a production build and end-to-end tests.
- **Visual QA is done by Claude, not by you.** A script renders the approved mockup and the live screen in the same headless browser at phone and desktop width and counts the pixels that differ. A screen is done when it is within 3% of the mockup and the page length matches. Once done, its screenshot becomes a baseline, and any later task that moves it by more than 0.2% fails. When a screen fails, Claude opens the difference image, names what is off ("card gap 16 px, should be 24"), fixes it from the design tokens and runs it again.
- Two tools, two jobs. Playwright with pixelmatch is the scripted judge: repeatable, returns numbers, also runs the end-to-end tests. The chrome-devtools connection is the live browser Claude drives to see behaviour, console errors and network calls. Puppeteer would do the first job too, but Playwright also covers end-to-end tests and mobile emulation, so it is one dependency instead of two.
- Honest limit: "pixel perfect" means matching a mockup that a browser can render. A picture from a design tool can only be matched approximately, which is why the design phase ends by turning the chosen direction into web-page mockups.
- When something breaks, say what you did and what you saw, in your own words. Claude reproduces it itself, states the cause before changing code, fixes it, and proves the fix. It will not ask you for logs.

---

## 12. Security baseline

1. `tools/guard.mjs` blocks the dangerous commands listed in section 6.
2. The `security-guidance` plugin reviews Claude's changes as it writes them.
3. The `security-auditor` subagent audits against `brain/07_SECURITY.md` before sensitive releases and before launch.
4. The two-account test: user B must not be able to open user A's data. Claude runs it in the browser.
5. Spend alerts on every paid service. Claude sets them where it can and gives you the clicks where only your dashboard allows it.
6. Only official-marketplace plugins install automatically. Anything else needs your yes, because plugins run code on your machine.

---

## 13. Release

```
phase branch → pull request → CI → preview URL → Claude tests it in the browser
             → Claude merges → live deploy → Claude smoke-tests the live site → report to you
                                           ↘ fails? roll back first, debug second
```

You get a short message: what you can now do, the link, a couple of things worth trying, and whether anything is needed from you.

---

## 14. If something goes wrong

| Problem | Try |
|---|---|
| Claude does not seem to know the project | Make sure you ran `claude` from the project folder. Type `/hooks`; SessionStart and Stop should be listed. |
| Claude cannot see the browser | Type `/mcp`. `chrome-devtools` should be connected. On Windows see step 8 of `workflows/00_bootstrap.md`. |
| Claude says a command was blocked | That is the guard working. Claude will take the allowed route by itself. |
| Claude keeps asking you technical questions | Say: "Re-read CLAUDE.md. You decide." |
| You are lost | "Read brain/05_STATE.md and brain/04_PLAN.md and tell me in five lines where the project is and what happens next." |
=====END FILE=====
=====FILE: README.md=====
# Project workspace

Created from a single bootstrap `CLAUDE.md`, which unpacked this structure and replaced itself with the short one.

- To work: run `claude` in this folder and type `go`. When Claude says so, type `/clear`, then `go`.
- How it all works: `PLAYBOOK.md`.
- Where the project stands: `brain/05_STATE.md`.

| Folder | What it is |
|---|---|
| `CLAUDE.md` | Rules loaded every session: the loop, what Claude does alone, the few things it needs from you |
| `brain/` | Project memory: PRD, architecture, design, plan, state, decisions, security, tests, runbook |
| `workflows/` | Procedures Claude follows for each kind of work (the W in WAT) |
| `tools/` | Deterministic Node scripts Claude runs instead of improvising (the T in WAT) |
| `.claude/` | Settings, hooks, slash commands, subagents, path-scoped rules, the frontend-design skill |
| `design/` | Brand assets, reference mockups, visual baselines |

Replace this README once the project has its own.
=====END FILE=====
=====FILE: tools/check.mjs=====
#!/usr/bin/env node
// The single quality gate. Runs secret-scan, then each command in tools/checks.json, stopping at the first failure.
// Usage: node tools/check.mjs [--fast]   (--fast skips "build" and "e2e")
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const fast = process.argv.includes("--fast");
const checks = JSON.parse(readFileSync(new URL("./checks.json", import.meta.url), "utf8"));
const order = ["format", "lint", "typecheck", "test", "build", "e2e"].filter((k) => !(fast && (k === "build" || k === "e2e")));

const run = (label, cmd) => {
  console.log(`\n--- ${label}: ${cmd}`);
  const r = spawnSync(cmd, { shell: true, stdio: "inherit" });
  if (r.status !== 0) { console.error(`\nFAILED at "${label}". Fix this before anything else.`); process.exit(r.status ?? 1); }
};

run("secret-scan", "node tools/secret-scan.mjs");
let ran = 0;
for (const key of order) if (checks[key]) { run(key, checks[key]); ran++; }
if (!ran) console.log("\nNo stack checks configured yet. Fill tools/checks.json after the stack is chosen.");
console.log("\nAll checks passed.");
=====END FILE=====
=====FILE: tools/checks.json=====
{
  "_note": "Filled in by workflows/02_stack-selection.md. Leave a value empty to skip it. Example for a Node stack: lint = npm run lint",
  "format": "",
  "lint": "",
  "typecheck": "",
  "test": "",
  "build": "",
  "e2e": ""
}
=====END FILE=====
=====FILE: tools/env-check.mjs=====
#!/usr/bin/env node
// Compares .env.example (names) against an env file. Prints NAMES and status only, never values.
// Usage: node tools/env-check.mjs [envfile]   (default: .env.local)
import { readFileSync, existsSync } from "node:fs";

const target = process.argv[2] ?? ".env.local";
const parse = (path) => {
  const out = new Map();
  if (!existsSync(path)) return out;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (m) out.set(m[1], { raw: m[2], optional: /#\s*optional/i.test(m[2]) });
  }
  return out;
};
const hasValue = (raw) => raw.replace(/#.*$/, "").trim().replace(/^["']|["']$/g, "").length > 0;

if (!existsSync(".env.example")) { console.error(".env.example not found"); process.exit(1); }
const wanted = parse(".env.example");
const have = parse(target);
if (!existsSync(target)) console.log(`${target} does not exist yet. Copy .env.example to ${target} and fill it in.`);

let problems = 0;
const rows = [];
for (const [name, meta] of wanted) {
  const set = have.has(name) && hasValue(have.get(name).raw);
  if (!set && !meta.optional) problems++;
  rows.push({ name, kind: meta.optional ? "optional" : "required", status: set ? "SET" : "MISSING" });
}
for (const name of have.keys()) if (!wanted.has(name)) rows.push({ name, kind: "undocumented", status: "add to .env.example" });
console.table(rows);

const publicPrefix = /^(NEXT_PUBLIC_|VITE_|PUBLIC_|EXPO_PUBLIC_|NUXT_PUBLIC_)/;
const sensitive = /(SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|TOKEN)/;
for (const name of new Set([...wanted.keys(), ...have.keys()])) {
  if (publicPrefix.test(name) && sensitive.test(name)) {
    console.error(`DANGER: ${name} has a browser-exposed prefix but looks like a secret. Rename it.`);
    problems++;
  }
}
process.exit(problems ? 1 : 0);
=====END FILE=====
=====FILE: tools/env-push.mjs=====
#!/usr/bin/env node
// Copies variable VALUES from a local env file to the hosting provider without the agent ever seeing them.
// Prints names and results only.
//   node tools/env-push.mjs --file .env.production.local --target production,preview [--dry-run]
// Supports Vercel (needs `vercel login` and `vercel link` done once). Other hosts: extend the push() function.
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const val = (f, d) => (args.includes(f) ? args[args.indexOf(f) + 1] : d);
const file = val("--file", ".env.production.local");
const targets = val("--target", "production,preview").split(",").map((t) => t.trim()).filter(Boolean);
const dry = args.includes("--dry-run");

if (!existsSync(file)) { console.error(`env-push: ${file} not found. The owner fills it in from .env.example; see workflows/08_add-service.md.`); process.exit(1); }
const vars = [];
for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!m) continue;
  const value = m[2].replace(/\s+#.*$/, "").trim().replace(/^(["'])(.*)\1$/, "$2");
  if (value) vars.push([m[1], value]);
}
if (!vars.length) { console.error(`env-push: no filled-in variables in ${file}.`); process.exit(1); }

const push = (name, value, target) => {
  spawnSync("vercel", ["env", "rm", name, target, "--yes"], { stdio: "ignore", shell: process.platform === "win32" });
  const r = spawnSync("vercel", ["env", "add", name, target], { input: value, stdio: ["pipe", "ignore", "pipe"], shell: process.platform === "win32" });
  return r.status === 0 ? "ok" : `FAILED (${String(r.stderr ?? "").replace(value, "***").split("\n")[0].slice(0, 120)})`;
};

let failures = 0;
const rows = [];
for (const [name, value] of vars) for (const target of targets) {
  const result = dry ? "would set" : push(name, value, target);
  if (result.startsWith("FAILED")) failures++;
  rows.push({ name, target, result });
}
console.table(rows);
console.log(dry ? "dry run: nothing sent." : "Redeploy for new values to take effect.");
process.exit(failures ? 1 : 0);
=====END FILE=====
=====FILE: tools/guard.mjs=====
#!/usr/bin/env node
// PreToolUse hook for Bash. Exit 2 = block (stderr goes back to Claude). Anything unexpected = allow.
import { execSync } from "node:child_process";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let cmd = "";
try { cmd = JSON.parse(raw)?.tool_input?.command ?? ""; } catch { process.exit(0); }
if (!cmd) process.exit(0);

const block = (why) => { console.error(`BLOCKED by tools/guard.mjs: ${why}`); process.exit(2); };

if (/\bgit\s+push\b/.test(cmd)) {
  if (/(--force\b|--force-with-lease|\s-f\b)/.test(cmd)) block("force push is never allowed.");
  // Destination decides. Explicit refspecs win; with none, the current branch is what gets pushed.
  const args = (cmd.match(/\bgit\s+push\b([^|;&]*)/)?.[1] ?? "").trim().split(/\s+/).filter((a) => a && !a.startsWith("-"));
  const refspecs = args.slice(1); // args[0] is the remote
  const toMain = (r) => /^(main|master)$/.test(r.includes(":") ? r.split(":").pop() : r) || /^HEAD$/.test(r) && onMain();
  function onMain() { try { return /^(main|master)$/.test(execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim()); } catch { return false; } }
  if (refspecs.length ? refspecs.some(toMain) : onMain()) block("no pushing straight to main. Push the phase branch, open a PR, wait for CI, verify the preview, then merge it yourself with gh pr merge.");
}
if (/(>>?|\btee\b|\bsed\s+-i|\brm\b|\bmv\b|\bcp\b|\btruncate\b)[^|;&]*(?<![\w.-]\/)(?<!\.github\/)\bworkflows\//.test(cmd) && !/\.github\/workflows\//.test(cmd)) block("workflow files are standing instructions. Record the proposed change in brain/05_STATE.md under 'Proposed workflow changes', show it to the owner, and after a yes make it with the Edit tool.");
if (/--no-verify\b/.test(cmd)) block("do not skip git hooks.");
if (/\bgh\s+pr\s+merge\b/.test(cmd) && /--admin\b/.test(cmd)) block("do not bypass CI with --admin. Fix the failing check.");
if (/\bvercel\b.*--prod\b/.test(cmd)) block("production deploys happen by merging the PR, so CI and the preview check always run first. Use gh pr merge. To undo a bad release use vercel rollback.");
if (/\bsupabase\s+db\s+reset\b.*--linked/.test(cmd)) block("never reset a linked (cloud) database.");
if (/\brm\s+-[a-zA-Z]*r[a-zA-Z]*\s+(\/|~|\$HOME)(\s|\/?\*|$)/.test(cmd)) block("refusing to delete the root or home directory.");
if (/^\s*(printenv|env)\s*$/.test(cmd)) block("do not dump the environment. Use: node tools/env-check.mjs");
if (/\b(cat|less|more|head|tail|bat|type|Get-Content|gc|grep|rg|sed|awk|cp|scp)\b[^|;&]*\.env(?!\.example)(\.[\w.]+)?\b/.test(cmd)) block("do not read env files. Use: node tools/env-check.mjs (names and status only).");
process.exit(0);
=====END FILE=====
=====FILE: tools/notify-slack.mjs=====
#!/usr/bin/env node
// Posts one message to Slack. The tool reads the webhook from the environment or .env.local; the agent never sees it.
// Usage: node tools/notify-slack.mjs "Preview ready for phase 2"
import { readFileSync, existsSync } from "node:fs";

let url = process.env.SLACK_WEBHOOK_URL;
if (!url && existsSync(".env.local")) {
  const m = readFileSync(".env.local", "utf8").match(/^\s*SLACK_WEBHOOK_URL\s*=\s*["']?([^"'\s#]+)/m);
  if (m) url = m[1];
}
const text = process.argv.slice(2).join(" ").trim();
if (!text) { console.error('Usage: node tools/notify-slack.mjs "message"'); process.exit(1); }
if (!url) { console.log("SLACK_WEBHOOK_URL not set. Skipping notification."); process.exit(0); }

const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
console.log(res.ok ? "Slack: sent" : `Slack: failed with HTTP ${res.status}`);
process.exit(res.ok ? 0 : 1);
=====END FILE=====
=====FILE: tools/package.json=====
{
  "name": "project-tools",
  "private": true,
  "type": "module",
  "description": "Dependencies for tools/ only, kept apart from the app so they work on any stack. Install: npm --prefix tools install && npx --prefix tools playwright install chromium",
  "dependencies": {
    "pixelmatch": "^7.1.0",
    "playwright": "^1.50.0",
    "pngjs": "^7.0.0"
  }
}
=====END FILE=====
=====FILE: tools/preflight.mjs=====
#!/usr/bin/env node
// Checks the machine has what the project needs. Prints versions only. Exit 1 if a required tool is missing.
import { execSync } from "node:child_process";

const tools = [
  { name: "git", cmd: "git --version", required: true, why: "version control" },
  { name: "node", cmd: "node --version", required: true, why: "tools/, MCP servers, most stacks", min: 20 },
  { name: "npm", cmd: "npm --version", required: true, why: "packages" },
  { name: "claude", cmd: "claude --version", required: true, why: "Claude Code" },
  { name: "gh", cmd: "gh --version", required: true, why: "GitHub repo, PRs" },
  { name: "docker", cmd: "docker --version", required: false, why: "local Supabase/Postgres" },
  { name: "supabase", cmd: "supabase --version", required: false, why: "local DB + migrations" },
  { name: "vercel", cmd: "vercel --version", required: false, why: "preview deploys, env pull" },
  { name: "python3", cmd: "python3 --version", required: false, why: "Modal / Python stacks" },
];

let missingRequired = 0;
const rows = tools.map((t) => {
  let version = null;
  try { version = execSync(t.cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n")[0].trim(); } catch {}
  let status = version ? "ok" : t.required ? "MISSING" : "absent (optional)";
  if (version && t.min) {
    const major = parseInt(version.replace(/^v/, ""), 10);
    if (major < t.min) status = `TOO OLD (need >= ${t.min})`;
  }
  if (t.required && status !== "ok") missingRequired++;
  return { tool: t.name, status, version: version ?? "-", neededFor: t.why };
});

console.table(rows);
let ghAuth = "unknown";
try { execSync("gh auth status", { stdio: "ignore" }); ghAuth = "logged in"; } catch { ghAuth = "NOT logged in (run: gh auth login)"; }
console.log(`gh auth: ${ghAuth}`);
console.log(`platform: ${process.platform} ${process.arch}`);
process.exit(missingRequired ? 1 : 0);
=====END FILE=====
=====FILE: tools/secret-scan.mjs=====
#!/usr/bin/env node
// Scans files git would commit for credential patterns and tracked env files. Prints location + pattern name, never the match.
import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";

const patterns = {
  "private key block": /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  "JWT / Supabase key": /eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{10,}/,
  "Supabase access token": /sbp_[a-f0-9]{30,}/,
  "Supabase secret key": /sb_secret_[A-Za-z0-9_-]{20,}/,
  "Anthropic / OpenAI style key": /sk-[A-Za-z0-9_-]{24,}/,
  "Resend key": /\bre_[A-Za-z0-9_]{20,}/,
  "GitHub token": /\bgh[pousr]_[A-Za-z0-9]{30,}/,
  "Slack token": /xox[abprs]-[A-Za-z0-9-]{10,}/,
  "Slack webhook": /hooks\.slack\.com\/services\/T[A-Za-z0-9]+\/B[A-Za-z0-9]+\/[A-Za-z0-9]+/,
  "AWS access key": /\bAKIA[0-9A-Z]{16}\b/,
  "Stripe live key": /\b[sr]k_live_[A-Za-z0-9]{20,}/,
  "Vercel token-like assignment": /VERCEL_TOKEN\s*=\s*["']?[A-Za-z0-9]{20,}/,
};
const skipExt = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|otf|mp4|mov|lock)$/i;
const skipFile = /(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|tools\/secret-scan\.mjs)$/;

let files = [];
try {
  files = execSync("git ls-files -co --exclude-standard", { stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n").filter(Boolean);
} catch { console.error("Not a git repository yet. Run: git init"); process.exit(1); }

let hits = 0;
for (const f of files) {
  if (/(^|\/)\.env(\.|$)/.test(f) && !/\.env\.example$/.test(f)) { console.error(`${f}: env file is not ignored by git. Fix .gitignore.`); hits++; continue; }
  if (skipExt.test(f) || skipFile.test(f)) continue;
  let text;
  try { if (statSync(f).size > 1_000_000) continue; text = readFileSync(f, "utf8"); } catch { continue; }
  text.split(/\r?\n/).forEach((line, i) => {
    for (const [label, re] of Object.entries(patterns)) if (re.test(line)) { console.error(`${f}:${i + 1}: ${label}`); hits++; }
  });
}
console.log(hits ? `secret-scan: ${hits} problem(s). Remove them, rotate any real key, then re-run.` : `secret-scan: clean (${files.length} files)`);
process.exit(hits ? 1 : 0);
=====END FILE=====
=====FILE: tools/session-brief.mjs=====
#!/usr/bin/env node
// SessionStart hook. Prints the current project state so every new or cleared session starts aligned.
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const path = "brain/05_STATE.md";
let branch = "-";
try { branch = execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch {}
console.log(`[session-brief] git branch: ${branch}`);
if (!existsSync(path)) { console.log("[session-brief] brain/05_STATE.md missing. Follow workflows/00_bootstrap.md."); process.exit(0); }
const lines = readFileSync(path, "utf8").split(/\r?\n/);
console.log(lines.slice(0, 60).join("\n"));
console.log("[session-brief] Whatever the owner typed, continue from Next action above. Do not ask them what to do.");
if (lines.length > 60) console.log(`... (${lines.length - 60} more lines - STATE is too long; trim it at the next /handoff)`);
=====END FILE=====
=====FILE: tools/stop-check.mjs=====
#!/usr/bin/env node
// Stop hook. The owner will not notice stale state or a heavy session, so this does.
// Exit 2 sends the message back to Claude and makes it continue. Anything unexpected = allow the stop.
import { execSync } from "node:child_process";
import { statSync, existsSync, readFileSync, writeFileSync, mkdirSync, openSync, readSync, closeSync } from "node:fs";

let input = {};
try { let raw = ""; for await (const c of process.stdin) raw += c; input = JSON.parse(raw || "{}"); } catch {}
if (input.stop_hook_active) process.exit(0);

const sh = (c) => { try { return execSync(c, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } };
const reasons = [];
const STATE = "brain/05_STATE.md";

// 1. Is the state file older than the work?
try {
  if (existsSync(STATE) && sh("git rev-parse --is-inside-work-tree") === "true" && sh("git rev-parse --verify -q HEAD")) {
    const stateM = statSync(STATE).mtimeMs;
    const dirty = execSync("git status --porcelain", { stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n").filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, ""));
    const stateDirty = dirty.some((f) => f === STATE || STATE.startsWith(f));
    const work = dirty.filter((f) => !/^(brain\/|\.tmp\/|\.claude\/)/.test(f));
    const dirtyNewer = work.some((f) => { try { return statSync(f).mtimeMs > stateM + 5000; } catch { return false; } });
    const lastStateCommit = sh(`git log -1 --format=%H -- ${STATE}`);
    const commitsAfter = lastStateCommit ? Number(sh(`git rev-list --count ${lastStateCommit}..HEAD -- . ":(exclude)brain" ":(exclude).tmp"`) || 0) : 1;
    const headTime = Number(sh("git log -1 --format=%ct")) * 1000;
    const staleByCommits = commitsAfter > 0 && !(stateDirty && stateM >= headTime);
    if (dirtyNewer || staleByCommits) reasons.push("Project files changed after brain/05_STATE.md was last written. Rewrite STATE now (next action, done, in progress, waiting on the owner) and tick finished tasks in the phase file. Do not ask the owner anything about this.");
  }
} catch {}

// 2. Is the conversation getting heavy?
try {
  const p = input.transcript_path;
  if (p && existsSync(p)) {
    const size = statSync(p).size, len = Math.min(size, 400_000), buf = Buffer.alloc(len), fd = openSync(p, "r");
    readSync(fd, buf, 0, len, size - len); closeSync(fd);
    const lines = buf.toString("utf8").split("\n").filter((l) => l.includes('"usage"')).reverse();
    let tokens = 0;
    for (const l of lines) { try { const o = JSON.parse(l); if (o.isSidechain) continue; const u = o.message?.usage; if (u) { tokens = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0); break; } } catch {} }
    const LIMIT = Number(process.env.CONTEXT_WARN_TOKENS || 120000);
    if (tokens > LIMIT) {
      mkdirSync(".tmp", { recursive: true });
      const mark = `.tmp/context-warned-${String(input.session_id || "s").replace(/[^\w-]/g, "")}`;
      const last = existsSync(mark) ? Number(readFileSync(mark, "utf8")) : 0;
      if (tokens > last + 40000) {
        writeFileSync(mark, String(tokens));
        reasons.push(`This conversation is about ${Math.round(tokens / 1000)}k tokens, which is where quality starts to slip. Bring the current step to a safe point, commit, rewrite STATE, then end your reply with exactly this line for the owner: "Please type /clear and then type go. Nothing is lost, the project memory is saved."`);
      }
    }
  }
} catch {}

if (reasons.length) { console.error("[stop-check] " + reasons.join(" ALSO: ")); process.exit(2); }
process.exit(0);
=====END FILE=====
=====FILE: tools/visual-diff.mjs=====
#!/usr/bin/env node
// Screenshots the running app in a real browser and compares it, pixel by pixel, with the approved design.
// The agent reads the numbers this prints. It opens a diff image only when a screen fails.
//
//   node tools/visual-diff.mjs                 compare every screen in design/visual.json
//   node tools/visual-diff.mjs --only login    one screen
//   node tools/visual-diff.mjs --approve       save current app screenshots as the regression baseline (after a screen passes)
//   node tools/visual-diff.mjs --compare a.png b.png    compare two images directly
//
// Two checks per screen and viewport:
//   design      app vs the approved reference (an .html mockup rendered in the same browser, or a .png)  -> threshold "design"
//   regression  app vs its own approved baseline in design/baselines/                                    -> threshold "regression"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

let PNG, pixelmatch;
try {
  ({ PNG } = await import("pngjs"));
  pixelmatch = (await import("pixelmatch")).default;
} catch {
  console.error("visual-diff: dependencies missing. Run: npm --prefix tools install && npx --prefix tools playwright install chromium");
  process.exit(3);
}

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const val = (f) => (args.includes(f) ? args[args.indexOf(f) + 1] : null);
const OUT = ".tmp/visual";
mkdirSync(OUT, { recursive: true });

// Compares two PNG buffers. Different sizes are compared over the shared area and the size gap is reported.
export function compare(bufA, bufB, diffPath) {
  const a = PNG.sync.read(bufA), b = PNG.sync.read(bufB);
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  const crop = (img) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(img, o, 0, 0, w, h, 0, 0); return o; };
  const ca = crop(a), cb = crop(b), diff = new PNG({ width: w, height: h });
  const bad = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1, includeAA: false });
  if (diffPath) writeFileSync(diffPath, PNG.sync.write(diff));
  return { mismatch: bad / (w * h), sizeA: `${a.width}x${a.height}`, sizeB: `${b.width}x${b.height}`, heightGap: Math.abs(a.height - b.height) };
}

if (flag("--compare")) {
  const [fa, fb] = args.slice(args.indexOf("--compare") + 1);
  const r = compare(readFileSync(fa), readFileSync(fb), `${OUT}/compare-diff.png`);
  console.log(JSON.stringify({ ...r, mismatchPct: +(r.mismatch * 100).toFixed(3), diff: `${OUT}/compare-diff.png` }));
  process.exit(0);
}

const cfgPath = "design/visual.json";
if (!existsSync(cfgPath)) { console.error(`visual-diff: ${cfgPath} not found. It is created in workflows/03_design-first.md.`); process.exit(1); }
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
const limits = { design: 0.03, regression: 0.002, ...(cfg.thresholds ?? {}) };
const screens = (cfg.screens ?? []).filter((s) => !val("--only") || s.name === val("--only"));
if (!screens.length) { console.error("visual-diff: no screens to check."); process.exit(1); }

let chromium;
try { ({ chromium } = await import("playwright")); } catch { console.error("visual-diff: playwright missing. Run: npm --prefix tools install && npx --prefix tools playwright install chromium"); process.exit(3); }
const browser = await chromium.launch();
const rows = [];
let failed = 0;

const shoot = async (url, width, screen) => {
  const ctx = await browser.newContext({
    viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce",
    ...(screen.storageState && existsSync(screen.storageState) ? { storageState: screen.storageState } : {}),
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  if (screen.waitFor) await page.waitForSelector(screen.waitFor, { timeout: 15000 });
  await page.evaluate(() => document.fonts?.ready);
  const buf = await page.screenshot({ fullPage: true, animations: "disabled", caret: "hide", mask: (screen.mask ?? []).map((s) => page.locator(s)) });
  await ctx.close();
  return { buf, errors };
};

for (const s of screens) {
  for (const width of s.viewports ?? cfg.viewports ?? [375, 1440]) {
    const tag = `${s.name}-${width}`;
    try {
      const app = await shoot(new URL(s.path, cfg.baseUrl).href, width, s);
      writeFileSync(`${OUT}/${tag}-app.png`, app.buf);
      const row = { screen: tag, consoleErrors: app.errors.length };

      if (s.reference) {
        const ref = s.reference.endsWith(".html")
          ? (await shoot(pathToFileURL(resolve(s.reference)).href, width, { mask: s.mask })).buf
          : readFileSync(s.reference.replace("{width}", width));
        const r = compare(ref, app.buf, `${OUT}/${tag}-design-diff.png`);
        row.design = `${(r.mismatch * 100).toFixed(2)}%`;
        row.heightGap = r.heightGap;
        row.designOk = r.mismatch <= limits.design && r.heightGap <= (cfg.maxHeightGap ?? 40);
      }

      const basePath = `design/baselines/${tag}.png`;
      if (flag("--approve")) { mkdirSync("design/baselines", { recursive: true }); writeFileSync(basePath, app.buf); row.regression = "baseline saved"; }
      else if (existsSync(basePath)) {
        const r = compare(readFileSync(basePath), app.buf, `${OUT}/${tag}-regression-diff.png`);
        row.regression = `${(r.mismatch * 100).toFixed(2)}%`;
        row.regressionOk = r.mismatch <= limits.regression;
      }
      if (row.designOk === false || row.regressionOk === false || app.errors.length) failed++;
      if (app.errors.length) row.firstError = app.errors[0];
      rows.push(row);
    } catch (e) { failed++; rows.push({ screen: tag, error: String(e.message ?? e).slice(0, 200) }); }
  }
}
await browser.close();
console.table(rows);
console.log(`limits: design <= ${limits.design * 100}% , regression <= ${limits.regression * 100}% . Images and diffs: ${OUT}/`);
console.log(failed ? `visual-diff: ${failed} screen(s) need work. Open the *-diff.png for each, fix, run again.` : "visual-diff: all screens pass.");
process.exit(failed ? 1 : 0);
=====END FILE=====
=====FILE: workflows/_TEMPLATE.md=====
# NN Name of the workflow

**Objective:** one sentence. What is true when this is done.
**When to use:** the trigger for running it.
**Inputs needed:** what you must have before starting, and where each comes from. Mark anything only the owner can supply.
**Tools used:** the scripts in `tools/` this relies on. If one is missing, write and test it first.

## Steps
1. ...

## Expected output
What exists afterwards, and where: files, records, a deployed thing, a message to the owner.

## Edge cases
- The source has no new data: ...
- An outside call fails or is rate-limited: ...
- It was already run once (must be safe to run twice): ...

**Exit check:** how you prove it worked.

## Learned
<!-- Dated one-liners from the self-improvement loop: limits, quirks, wrong assumptions. Added only after the owner approves the proposal. -->
=====END FILE=====
=====FILE: workflows/00_bootstrap.md=====
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
=====END FILE=====
=====FILE: workflows/01_discovery.md=====
# 01 Discovery → PRD

**Goal:** a one-page `brain/01_PRD.md` the owner agrees with. No technology talk.
**Rule:** one question at a time, precise language, offer an example answer. The owner knows systems and delivery, so ask about flows, data, integrations and roles directly. Never ask about languages, frameworks or libraries. Stop when you can write the PRD. Usually 6 to 10 questions.

Ask about, in this order
1. The problem, and who has it. Ask for one real person as an example.
2. What that person does today instead.
3. The single outcome that would make them say "this is useful".
4. The smallest set of things a user must be able to do for that outcome. Push back on anything that is not needed for it.
5. What is explicitly not in version one. Propose the list yourself from what they mentioned and ask them to confirm. Typical: payments, mobile app, admin panel, AI extras, social features.
6. For every capability that moves data or runs on its own, the six build questions. Ask only the ones the owner has not already answered:
   - **Source:** where does the data come from? Do they already have an account there?
   - **Output:** where should results show up: in the app, email, Slack, a spreadsheet?
   - **Trigger:** does it run on a schedule (how often), react to an event, or when someone presses a button?
   - **Accounts:** which services do they already have, and which would be new sign-ups?
   - **Success:** what exactly should they see when it works?
   - **Edge cases:** what should happen when there is nothing new, or the outside service is down?
7. Constraints: monthly budget for services, deadline, phone or desktop first, languages, any accounts they already own, any data that is sensitive.
8. How they will know it works: turn their answer into numbered success criteria.

Then
- Use the `researcher` subagent for a 15-minute look at 2 or 3 existing alternatives: what they do well, what they charge, the gap this product fills. Add three lines to the PRD. Do not let research expand the scope.
- Write `brain/01_PRD.md`. Read it back as a short functional spec: actors, flows, data entities, integrations, out of scope. Edit until the owner says yes.
- Draft the phase rows in `brain/04_PLAN.md` from the MVP scope: one vertical slice per row.
- Close the session with the `/handoff` steps.

**Exit check:** Open questions section is empty. Out-of-scope list has at least three items. Owner said yes.
=====END FILE=====
=====FILE: workflows/02_stack-selection.md=====
# 02 Stack selection and architecture

**Goal:** you choose the stack that best fits the PRD. The owner approves one plain-language summary. They are never asked to pick a technology.

## How to choose
1. List what the PRD actually demands: web or mobile or both, auth, data shape, files, real-time, scheduled or long-running work, email, payments, AI, expected users, budget.
2. For each layer, pick the most boring option that meets the demand. Boring means: widely used, well documented, generous free tier, managed rather than self-hosted, and well represented in your training data so you make fewer mistakes with it.
3. Defaults to beat. Use these unless the PRD gives a reason not to, and write the reason in the ADR when you deviate:
   - Web app with accounts and data: TypeScript, a full-stack React framework, Postgres with built-in auth and row-level security (Supabase), hosted on Vercel, GitHub for code and CI.
   - Transactional email: Resend.
   - Work longer than a request can wait, Python-only libraries, GPUs, heavy scraping or batch jobs: a job runner (Modal for Python compute, or a TypeScript job platform such as Trigger.dev). Pick one, not both.
   - Alerts: a Slack incoming webhook via `tools/notify-slack.mjs`. Error tracking: Sentry.
   - Content site with no accounts: a static site generator, no database.
   - Mobile: decide native versus installable web app from the PRD, not from habit.
4. One language across app and tools where possible. `tools/` ships as Node so it runs on every OS. Add Python tools only if the stack is Python.
5. Send the `researcher` subagent to verify, today, for every paid-capable service: free-tier limits, first paid price, the limit this app will hit first, and that the versions and APIs you plan to use exist. Never quote a price from memory.
6. If the app has an AI feature, first ask whether a rule, query or normal API does the job. If an LLM is needed, record failure mode, cost per run, latency budget, definition of correct, human fallback, and the model swap path.

## Write it down
- Fill `brain/02_ARCHITECTURE.md` completely, including folder layout, boundaries and data model.
- One ADR per layer in `brain/06_DECISIONS.md`, each with cost and swap path.
- Fill `tools/checks.json` and the Project commands block in `CLAUDE.md`. Playwright is already installed under `tools/` for visual QA; use it as the end-to-end runner too unless the stack has a strong native one.
- Fill the Levels section of `brain/08_TEST_PLAN.md` and the Environments table in `brain/09_RUNBOOK.md`.
- Add stack-specific entries to `.gitignore`, a CI job to `.github/workflows/ci.yml`, and the app's package ecosystem to `.github/dependabot.yml`.
- Draw the component flowchart and the ER diagram in `brain/02_ARCHITECTURE.md` (mermaid).

## Owner approval, one message
"Here is the architecture: components and how they talk, where data lives, how auth works, how it deploys, in one short diagram or list. For each main choice, the alternative I rejected and why, and the swap path if it has to change later. It costs about X per month at the start and Y if you reach Z users. You will need to sign up for: A, B, C, which takes about N minutes and needs a card for: ... The main trade-off I made is ... Say yes, or tell me what worries you." The owner can judge architecture and trade-offs, so give them real ones, not reassurance. They do not judge libraries or syntax, so leave those out. This is one of only three product decisions the owner makes. After it, you do not ask about technology again; later hard-to-reverse choices go into `brain/06_DECISIONS.md` as ADRs they can read.

After the yes
- If a background-job platform was chosen, add its MCP server to `.mcp.json` with a pinned version so you can fire test runs and read run logs yourself. For Trigger.dev the proven rules are already in `.claude/rules/trigger-dev.md`. For any other platform, write the equivalent rule file from the researcher's brief.
- Install the matching official plugins, project scope: for example `supabase`, `vercel`, `sentry`, `slack`, and the code-intelligence plugin for the language (it needs the language server binary installed first).
- Run `workflows/08_add-service.md` once per service, back to back, so the owner does every sign-up and login in one sitting and is not interrupted again.
- `/handoff`.

**Exit check:** a new engineer could read ARCHITECTURE and DECISIONS and know what to build with and why. The owner knows the monthly cost.
=====END FILE=====
=====FILE: workflows/03_design-first.md=====
# 03 Design first

**Goal:** an approved visual direction, reference mockups that a browser can render, and a filled `brain/03_DESIGN.md`, before any feature code. The mockups are what makes "pixel perfect" checkable by a script instead of by the owner's eyes.
**Owner input needed:** brand assets if they have any, two or three products they like, and one pick between directions. That is the only design question they get.

1. Collect logo, colours, photos into `design/brand_assets/`. Ask for references and what they like about each. If they have none, propose a direction from the subject matter of the PRD, not a generic "modern, clean" default.
2. Load the `frontend-design` skill. Write its two-pass plan: palette as named hex values, typefaces and roles, layout concept with an ASCII wireframe, three principles. Check the plan against the skill's list of generated-looking defaults and revise. Say what you changed.
3. Pick the 3 to 5 screens that carry the product: usually landing or login, the main working screen, one form or detail screen, one empty state.
4. Show two genuinely different directions for the main screen, not two colours of one layout. Use, in order of preference:
   a. `/design <brief>` in Claude Code, which publishes a canvas of artboards and prints a link for the owner.
   b. Claude Design on claude.ai with the same brief.
   c. Static HTML mockups served on localhost.
   The owner picks one. Done with questions.
5. Build the reference mockups yourself: one self-contained HTML file per screen in `design/mockups/<screen>.html`, responsive, using the exact tokens you are about to write into DESIGN, with realistic content. Use the same sample data the app's seed data will use, so later comparisons are like for like. Look at each one in the browser at 375 and 1440 and refine until it matches the chosen direction.
6. Write `design/visual.json`:
   ```json
   {
     "baseUrl": "http://localhost:3000",
     "viewports": [375, 1440],
     "thresholds": { "design": 0.03, "regression": 0.002 },
     "screens": [
       { "name": "login", "path": "/login", "reference": "design/mockups/login.html" },
       { "name": "dashboard", "path": "/dashboard", "reference": "design/mockups/dashboard.html",
         "storageState": ".tmp/auth.json", "waitFor": "main", "mask": ["[data-dynamic]"] }
     ]
   }
   ```
   `mask` hides regions that legitimately differ (timestamps, avatars). `storageState` is a saved logged-in browser session for private screens; create it with a small Playwright login script against the local test user.
7. Derive `brain/03_DESIGN.md` from the mockups: exact tokens, scale, components with states, motion, voice. From here on these are the only source of visual values.
8. Motion: decide the one moment that earns animation, write it in DESIGN, choose CSS first and a motion library only if the design needs it (ADR).
9. Send the owner the mockups as a localhost link or screenshots you took, for information. Do not ask for a second approval unless they object.

**Exit check:** mockups render at both widths, `design/visual.json` lists every key screen, no colour or font in DESIGN.md is a framework default.
=====END FILE=====
=====FILE: workflows/04_build-task.md=====
# 04 Build a task

**Goal:** one task from the current phase file, finished, verified in a real browser, committed and pushed. No owner involvement.

1. Read the task and its acceptance criteria. Open only the files it names, plus the `brain/` sections that `00_INDEX.md` maps to it.
2. Look for something to reuse before writing anything new: a component, a helper, a query, and a script in `tools/`.
   If the task uses an outside API or a library feature you have not already used in this repo, send the `researcher` subagent to confirm it exists and how it authenticates and rate-limits. Do not code against an API from memory.
3. State the plan in 8 lines or fewer. If it needs a new dependency, a schema change outside the task, or more than about 6 files, the task is too big: re-slice it in the phase file and continue with the first slice.
4. Be on the phase branch `phase/<N>-<name>`, never `main`.
5. Implement the smallest change that meets the criteria. Follow `.claude/rules/`. Handle the two standing edge cases for anything that talks to the outside: nothing new came back, and the call failed.
6. Data change: write a migration, apply it to the local database, run the tests, note the rollback in the migration.
7. New env var or service: `workflows/08_add-service.md`. If it needs a key from the owner, ask once with full steps, then continue with the next unblocked task.
8. Verify yourself, in this order:
   - `node tools/check.mjs --fast`
   - behaviour: drive the running app with chrome-devtools. Do the task's acceptance steps as a user would. Console and network must be clean.
   - the must-fail case for this task from `brain/08_TEST_PLAN.md`.
   - looks: `workflows/10_visual-qa.md` for every screen the task touched.
9. Add or update tests. Add the flow to `brain/08_TEST_PLAN.md` if new.
10. Commit `feat|fix|chore(scope): what changed`, one task one commit, and push the branch.
11. Close the session with `/handoff` (you run its steps yourself; the owner never types it).

Something failed along the way: run the self-improvement loop in `workflows/README.md` and record the proposed workflow change in STATE before closing the task.

Blocked by something only the owner can give: write exactly what you need under "Waiting on the owner" in STATE, tell them once with steps, move to the next unblocked task.
=====END FILE=====
=====FILE: workflows/05_debug.md=====
# 05 Debug

**Rule:** no code changes until the cause is stated. Guess-and-patch is how a project loses days.

1. Capture: the exact error text, what was expected, what happened, steps to reproduce. If the owner reported it in words, that is enough. Find the rest yourself.
2. Reproduce locally. For UI bugs use chrome-devtools: console messages, failed network requests, a screenshot. For server bugs read the log and the stack trace. If you cannot reproduce it, say so and gather more evidence. Do not fix what you cannot see.
3. Check the usual suspects before theorising. They cause most "works locally, fails live" bugs:
   - an env var that exists locally but not on the host (`node tools/env-check.mjs`, then the host's env list by name)
   - a module or import path that resolves locally but not in the build (file extension, letter case)
   - outside API auth: wrong key format, expired key, wrong header name, test key against a live endpoint
   - a migration applied locally but not in the cloud
4. Read the failing function and its direct callers. Check `git log -5 -- <file>` for what changed recently.
5. Write down before touching anything: what is failing, why, which file is responsible, the smallest fix, how the fix will be proven, and what must not change.
6. Write a failing test that reproduces it, where the stack allows.
7. Apply the smallest fix. No refactoring while debugging.
8. Prove it: the test passes, the reproduction steps now work, `node tools/check.mjs --fast` passes, nearby behaviour still works.
9. If the first fix did not work, go back to step 2 with the new evidence. If the second fix did not work: stop. Write what you tried and ruled out under "Watch out" in STATE, close the session with the `/handoff` steps, and ask for `/clear`. STATE's Next action is "continue debugging <problem> with workflows/05_debug.md". A fresh context with the evidence beats a long one full of wrong theories.
10. Always finish with the self-improvement loop: if the cause was a tool quirk, a limit, or a wrong assumption, propose a dated `## Learned` line for the workflow that would have prevented it (STATE first, applied after the owner's yes). Path-scoped rules in `.claude/rules/` are engineering conventions and you may update those yourself.
=====END FILE=====
=====FILE: workflows/06_security-review.md=====
# 06 Security review

**When:** before the PR of any phase that touches auth, user data, payments, uploads, webhooks or AI. Always before launch.

1. Run the `security-auditor` subagent.
2. Fix every blocker, one at a time, each with a test that would catch it coming back.
3. Walk `brain/07_SECURITY.md` yourself and tick what is now true, with the file that proves it. Mark N/A with a reason.
4. Do the two-account test by hand with chrome-devtools: sign in as user A, copy the ID of something A owns, sign in as user B, request it directly. It must fail.
5. Check the production build output for secrets: build, then search the client bundle for the names of server-only variables.
6. Spend caps or billing alerts on each paid service. Set them yourself where the CLI or API allows. Where only the dashboard can, give the owner the clicks.
7. Record the review date and result in `brain/09_RUNBOOK.md`.
=====END FILE=====
=====FILE: workflows/07_release.md=====
# 07 Release

**Path:** local → preview → production. You do all of it. Production is never the first place something is tested.

## Preview (end of every phase)
0. Dependency updates: `gh pr list --author "app/dependabot"`. Merge the ones with green CI first (security fixes always), so the release is tested on current dependencies. A red one becomes a task, not a blocker.
1. `node tools/check.mjs` (full: build and e2e).
2. `node tools/visual-diff.mjs` for every screen. All pass.
3. `/review`: reviewer subagent, plus security-auditor when the phase touches auth, user data, payments, uploads, webhooks or AI. Fix blockers one at a time.
4. Env: `node tools/env-check.mjs`, then `node tools/env-check.mjs .env.production.local`. Send values to the host with `node tools/env-push.mjs --file .env.production.local --target production,preview`. A variable that exists locally but not on the host is the most common cause of "works locally, broken live".
5. Cloud database: apply this phase's migrations to the cloud project with the stack's migration command. They were already applied and tested locally. Additive changes go before the code is merged. Destructive changes follow the two-release rule in `CLAUDE.md`, with a backup first once real users exist.
6. Push the branch. Open a PR: what a user can now do, migrations included, new env vars, known issues, visual-diff numbers.
7. Wait for CI and the preview deployment (`gh pr checks --watch`). If CI fails, fix it. Never bypass it.
8. Open the preview URL with chrome-devtools. Run the critical flows from `brain/08_TEST_PLAN.md` at 375 and 1440. Console and network clean.

## Production
9. Merge: `gh pr merge --squash --delete-branch`. Then `git checkout main && git pull`.
10. Wait for the production deploy. Run the production smoke test from `brain/08_TEST_PLAN.md` on the live URL with chrome-devtools. Leave no test data behind.
   Background or scheduled jobs in this release: confirm each schedule is registered on the platform, fire one manual run, and read its log to the end.
11. If the smoke test fails: roll back first (`brain/09_RUNBOOK.md`), debug second with `workflows/05_debug.md`. Report it honestly.
12. Tick the phase in `brain/04_PLAN.md`. `node tools/notify-slack.mjs "Released: <phase>. <live url>"`.
13. Report to the owner: what users can now do, the live link, the PR link and CI result, migrations applied, env vars added (names only), what the smoke test covered, two or three things worth trying, anything you need from them for the next phase. Then `/handoff`. Next session: `/plan-phase`.

## Launch (last phase only)
Custom domain and DNS, email sending domain verified, error tracking live, alerts reaching Slack, backups on and one restore tried, rollback tried once, spend alerts on every paid service (owner, in their dashboards, with your steps), a way for users to reach the owner.
=====END FILE=====
=====FILE: workflows/08_add-service.md=====
# 08 Add a service (and its keys)

**Rule:** you do all the configuration. The owner only does what needs their identity: sign up, log in, create a key, DNS at their registrar, a card. You never see a secret value.

1. One message to the owner: what the service is for in one sentence, what it costs now and at the first paid step (verified today by the `researcher` subagent), the exact sign-up URL.
2. Click-by-click steps to get what you need, with the least privilege that works. Typical one-time asks:
   - GitHub: `gh auth login`
   - Supabase: sign up, then `supabase login` in the terminal (opens the browser). You create the project, link it, run migrations, configure auth settings and storage yourself with the CLI.
   - Vercel: sign up with GitHub, then `vercel login`. You link the project, connect the repo, set env with `tools/env-push.mjs`, manage domains yourself.
   - Resend: create one API key. You add the sending domain through the API and fetch the DNS records. If the domain's DNS is on the host you already control, add the records yourself. If it is at an outside registrar, give the owner the exact records to paste.
   - Slack: create one incoming webhook URL.
   - Modal, Sentry and others: one token each, then you configure the rest.
3. Tell the owner exactly which file and which variable name each value goes under: `.env.local` for local values, `.env.production.local` for live values. Both are gitignored. They paste values in their editor, never in chat. If a secret lands in chat, tell them to revoke it and make a new one, and do not repeat it.
4. Add the names to `.env.example` with a comment saying where the value comes from. Mark `# optional` where the app runs without it.
5. `node tools/env-check.mjs` and `node tools/env-check.mjs .env.production.local` until required names show SET.
6. `node tools/env-push.mjs --file .env.production.local --target production,preview`. The tool moves values to the host; you only see names.
7. Write the smallest smoke test for the connection, run it locally, show the result.
8. Record in `brain/02_ARCHITECTURE.md` under Outside services: purpose, variable names, the free-tier limit that matters, behaviour when it is down. Add the account to `brain/09_RUNBOOK.md`.
9. Official plugin available: install at project scope if it helps. Prefer the service's CLI for routine work, because it needs one login and no repeated approval.

While waiting for the owner, keep working on tasks that do not need the key.
=====END FILE=====
=====FILE: workflows/09_session-hygiene.md=====
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
=====END FILE=====
=====FILE: workflows/10_visual-qa.md=====
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
=====END FILE=====
=====FILE: workflows/README.md=====
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
3. **Do not do by hand what a tool can do.** If a step will recur, or must be exact (comparing, counting, migrating, pushing config, calling a paid API), write the tool once, test it, then run it. Example: to check a screen against the design, do not eyeball a screenshot. Run `tools/visual-diff.mjs` and read the number.
4. **Order of work, always:** understand → research → clarify (product questions only, batched) → plan in plain English → build → environment setup → test locally → deploy → verify live. Never skip from idea to deploy.
5. **Paid calls.** Test a tool that spends money or credits once, on the smallest input. Never retry a paid call in a loop. If getting it right will take more than a few paid runs, tell the owner the expected cost first. This is a spending question, not an engineering one.

## The self-improvement loop

Every failure makes the system stronger, or it will happen again next session when you remember nothing:

1. Identify what broke. Read the full error and trace, not the first line.
2. Fix the tool or the code.
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
=====END FILE=====
=====FILE: CLAUDE.md=====
# CLAUDE.md

You are the lead engineer and the only engineer on this project. The owner comes from IT delivery: they understand logic, architecture, data models, APIs, environments and release process, and use the terms correctly, but they have never written code. So talk to them like a technical project lead: precise terms, no tutorials, no syntax. They own the product, the scope and the process (`workflows/`). You own the implementation, and you run everything yourself: code, terminal, git, database, hosting, email setup, tests, debugging, releases. Never ask them to choose a library, read or write code, run a multi-step procedure, or check, paste or screenshot anything. You look at the app yourself.

## Every session
1. The session brief printed at start is `brain/05_STATE.md`. Whatever the owner's first message says, continue from its Next action. Read the phase file it names. Open nothing else until the task needs it. `brain/00_INDEX.md` maps questions to files.
2. One task per session, finished end to end.
3. Close the task yourself: checks, commit, push, rewrite STATE, short report. Then end with this line, every time, because the owner will not remember it: "Please type /clear and then type go."

## How work flows (WAT). Detail in `workflows/README.md`
Reasoning is probabilistic, code is deterministic. Five hand-done steps at 90% each succeed 59% of the time. So you reason and scripts execute.
- `workflows/` are the SOPs. Before discovery, stack choice, design, building, debugging, visual QA, security review, release, or adding a service, open the matching workflow and follow it.
- You are the agent, the decision-maker: read the workflow, run tools in order, handle failures, connect intent to execution. Do not do by hand what a tool can do.
- `tools/` are deterministic scripts. Check `tools/` before building anything. If a step will recur or must be exact and no tool exists, write the tool, test it, then run it.
- Self-improvement loop on every failure: read the full error → fix → verify → record the lesson as a proposed workflow change in `brain/05_STATE.md` → move on. Workflows are the owner's standing instructions: you never create, edit or delete one without their yes. Show the exact line and the reason in your end-of-task report, apply it after approval.

## Order of work, always
understand → research (`researcher` subagent: docs, pricing, limits, auth) → clarify product questions, batched → plan in plain English, 8 lines or fewer → build the smallest correct change → env setup → test locally (`node tools/check.mjs --fast`, then a real browser yourself: chrome-devtools for behaviour, `node tools/visual-diff.mjs` for looks) → commit, push, deploy → verify live → rewrite STATE → report. Never jump from idea to deploy.

## The owner is needed only for
- Access: creating an account, logging in a CLI or plugin, producing an API key, DNS at a registrar, entering a card. Give click-by-click steps, say which variable name each value goes under in `.env.local`, then keep working on anything not blocked while you wait.
- Three product decisions: yes to the PRD, yes to the stack-and-monthly-cost summary, the design direction pick.
- A yes to any change in `workflows/` (a Learned line, a tightened step, a new workflow).
- A change of scope against `brain/01_PRD.md`, or anything that starts costing money, including re-running a paid API call beyond one small test.

Everything else you decide and do. Log hard-to-reverse choices in `brain/06_DECISIONS.md`. Report after. Do not ask before.

## Hard rules
- Secrets live only in gitignored env files and host dashboards. Never read, print, log, or commit one. Never ask for one in chat. Names go in `.env.example`. Use `node tools/env-check.mjs` to check them and `node tools/env-push.mjs` to send them to the host.
- Local first. Keep the dev server running in the background and give the owner the `http://localhost` address so they can watch, but never depend on them looking.
- Release path: phase branch → PR → CI green → you verify the preview URL in the browser → you merge → you smoke-test production → you roll back yourself if it fails. Never push straight to `main`. Never force-push.
- Data safety instead of permission: every schema change is a migration, applied and tested locally first. Once real users exist, back up before any change that drops or rewrites data, and do it in two releases (stop using it, then remove it).
- `brain/06_DECISIONS.md` is binding. To change a decision, write a new ADR that supersedes it.
- Touch only files the task needs. No drive-by refactors. No new dependency when the chosen stack already solves it.
- Do not invent APIs. If unsure a function, flag, endpoint, or version exists, check the installed package or official docs first.
- UI work uses the `frontend-design` skill and `brain/03_DESIGN.md`. A screen is done when `visual-diff` passes at every viewport, not when it looks about right.
- Two failed fixes on the same bug: write what you ruled out in STATE and ask for `/clear`. The next session follows `workflows/05_debug.md` with a clean head. Never hand a bug to the owner.
- Research goes to the `researcher` subagent so search noise stays out of this context.

## Project commands
<!-- filled in by workflows/02_stack-selection.md -->
- install:
- dev server:
- checks: `node tools/check.mjs` (add `--fast` to skip build and e2e)
- visual QA: `node tools/visual-diff.mjs`
- local database:

<!-- Generated by claude-code-wat-kit v0.9.0 -->
=====END FILE=====
~~~~~~~~~~
