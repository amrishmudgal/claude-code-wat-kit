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
