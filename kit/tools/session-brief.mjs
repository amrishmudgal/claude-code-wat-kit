#!/usr/bin/env node
// SessionStart hook. Prints the current project state so every new or cleared session starts aligned.
import { readFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const path = "brain/05_STATE.md";
let branch = "-";
try { branch = execSync("git rev-parse --abbrev-ref HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch {}
console.log(`[session-brief] git branch: ${branch}`);
if (!existsSync(path)) { console.log("[session-brief] brain/05_STATE.md missing. Follow workflows/00_bootstrap.md."); process.exit(0); }
const lines = readFileSync(path, "utf8").split(/\r?\n/);
console.log(lines.slice(0, 60).join("\n"));
console.log("[session-brief] Whatever the owner typed, continue from Next action above. Do not ask them what to do.");
if (lines.length > 60) console.log(`... (${lines.length - 60} more lines - STATE is too long; trim it at the next /handoff)`);
