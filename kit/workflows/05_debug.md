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
