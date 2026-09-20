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
