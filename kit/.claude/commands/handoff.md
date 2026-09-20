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
