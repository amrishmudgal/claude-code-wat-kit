#!/usr/bin/env node
// Stop hook. The owner will not notice stale state or a heavy session, so this does.
// Exit 2 sends the message back to Claude and makes it continue. Anything unexpected = allow the stop.
import { execSync } from "node:child_process";
import { statSync, existsSync, readFileSync, writeFileSync, mkdirSync, openSync, readSync, closeSync } from "node:fs";

let input = {};
try { let raw = ""; for await (const c of process.stdin) raw += c; input = JSON.parse(raw || "{}"); } catch {}
if (input.stop_hook_active) process.exit(0);

const sh = (c) => { try { return execSync(c, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } };
const reasons = [];
const STATE = "brain/05_STATE.md";

// 1. Is the state file older than the work?
try {
  if (existsSync(STATE) && sh("git rev-parse --is-inside-work-tree") === "true" && sh("git rev-parse --verify -q HEAD")) {
    const stateM = statSync(STATE).mtimeMs;
    const dirty = execSync("git status --porcelain", { stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n").filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, ""));
    const stateDirty = dirty.some((f) => f === STATE || STATE.startsWith(f));
    const work = dirty.filter((f) => !/^(brain\/|\.tmp\/|\.claude\/)/.test(f));
    const dirtyNewer = work.some((f) => { try { return statSync(f).mtimeMs > stateM + 5000; } catch { return false; } });
    const lastStateCommit = sh(`git log -1 --format=%H -- ${STATE}`);
    const commitsAfter = lastStateCommit ? Number(sh(`git rev-list --count ${lastStateCommit}..HEAD -- . ":(exclude)brain" ":(exclude).tmp"`) || 0) : 1;
    const headTime = Number(sh("git log -1 --format=%ct")) * 1000;
    const staleByCommits = commitsAfter > 0 && !(stateDirty && stateM >= headTime);
    if (dirtyNewer || staleByCommits) reasons.push("Project files changed after brain/05_STATE.md was last written. Rewrite STATE now (next action, done, in progress, waiting on the owner) and tick finished tasks in the phase file. Do not ask the owner anything about this.");
  }
} catch {}

// 2. Is the conversation getting heavy?
try {
  const p = input.transcript_path;
  if (p && existsSync(p)) {
    const size = statSync(p).size, len = Math.min(size, 400_000), buf = Buffer.alloc(len), fd = openSync(p, "r");
    readSync(fd, buf, 0, len, size - len); closeSync(fd);
    const lines = buf.toString("utf8").split("\n").filter((l) => l.includes('"usage"')).reverse();
    let tokens = 0;
    for (const l of lines) { try { const o = JSON.parse(l); if (o.isSidechain) continue; const u = o.message?.usage; if (u) { tokens = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0); break; } } catch {} }
    const LIMIT = Number(process.env.CONTEXT_WARN_TOKENS || 120000);
    if (tokens > LIMIT) {
      mkdirSync(".tmp", { recursive: true });
      const mark = `.tmp/context-warned-${String(input.session_id || "s").replace(/[^\w-]/g, "")}`;
      const last = existsSync(mark) ? Number(readFileSync(mark, "utf8")) : 0;
      if (tokens > last + 40000) {
        writeFileSync(mark, String(tokens));
        reasons.push(`This conversation is about ${Math.round(tokens / 1000)}k tokens, which is where quality starts to slip. Bring the current step to a safe point, commit, rewrite STATE, then end your reply with exactly this line for the owner: "Please type /clear and then type go. Nothing is lost, the project memory is saved."`);
      }
    }
  }
} catch {}

if (reasons.length) { console.error("[stop-check] " + reasons.join(" ALSO: ")); process.exit(2); }
process.exit(0);
