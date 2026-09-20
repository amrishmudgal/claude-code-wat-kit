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
