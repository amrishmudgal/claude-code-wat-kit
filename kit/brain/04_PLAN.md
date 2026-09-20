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
