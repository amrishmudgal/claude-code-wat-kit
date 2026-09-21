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

Two habits are built into every task. **Order of work:** understand, research, clarify product questions, plan in plain English, build, set up settings, test locally, deploy, verify live. **Deterministic first:** anything that recurs, must be exact, touches secrets or spends money is a script, and proof is always an exit code or a number (tests, pixel diff, smoke test), never "I looked and it seems fine". The same rule shapes the app: business rules live in tested code and database constraints, and any AI call sits at the edge returning validated data. **Self-improvement:** when something fails, Claude fixes it, proves the fix, and proposes a change to the procedure it belongs to. You approve it, and the same mistake does not come back in a later session. Procedures never change behind your back.

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
