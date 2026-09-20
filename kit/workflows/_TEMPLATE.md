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
