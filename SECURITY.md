# Security

This kit is a set of guard rails for an AI agent operating with real credentials on a real machine. Treat weaknesses in those rails as security issues.

## Report privately

Use GitHub's **Report a vulnerability** button (Security tab → Advisories). Please do not open a public issue for:

- a command pattern that gets past `kit/tools/guard.mjs` to force-push, push to `main`, bypass CI, reset a cloud database, or read an env file
- a path by which a secret value reaches the chat, a log, a commit or a CI artifact
- a way to make the installer write outside the project folder

Expect a first response within a week.

## Scope and limits, stated plainly

- The guard is pattern matching on shell commands. It raises the cost of a mistake; it is not a sandbox. For stronger isolation run Claude Code in its sandbox mode or a container.
- `deny` rules on `Read(.env*)` cover Claude Code's file tools. The guard covers the common shell readers. An unusual reader could still get through. Keep production secrets scoped and rotatable.
- The installer refuses absolute paths and `..` in payload entries and writes nothing if the file count is wrong.
- Only install `dist/CLAUDE.md` from a source you trust. It is instructions for an agent with shell access. Read it first; it is plain text.
