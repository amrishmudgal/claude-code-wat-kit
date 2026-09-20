---
description: Fresh-eyes review of the current branch with the reviewer subagent, plus the security auditor when the phase is sensitive.
---
1. Run the `reviewer` subagent on this branch.
2. If the diff touches auth, user data, payments, uploads, webhooks or an AI feature, also run `security-auditor`.
3. Fix blockers and should-fix items one at a time, re-running `node tools/check.mjs --fast` after each.
4. Mention to the owner only what changes what they will see or pay.
