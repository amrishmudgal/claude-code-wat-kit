#!/usr/bin/env node
// Checks the machine has what the project needs. Prints versions only. Exit 1 if a required tool is missing.
import { execSync } from "node:child_process";

const tools = [
  { name: "git", cmd: "git --version", required: true, why: "version control" },
  { name: "node", cmd: "node --version", required: true, why: "tools/, MCP servers, most stacks", min: 20 },
  { name: "npm", cmd: "npm --version", required: true, why: "packages" },
  { name: "claude", cmd: "claude --version", required: true, why: "Claude Code" },
  { name: "gh", cmd: "gh --version", required: true, why: "GitHub repo, PRs" },
  { name: "docker", cmd: "docker --version", required: false, why: "local Supabase/Postgres" },
  { name: "supabase", cmd: "supabase --version", required: false, why: "local DB + migrations" },
  { name: "vercel", cmd: "vercel --version", required: false, why: "preview deploys, env pull" },
  { name: "python3", cmd: "python3 --version", required: false, why: "Modal / Python stacks" },
];

let missingRequired = 0;
const rows = tools.map((t) => {
  let version = null;
  try { version = execSync(t.cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().split("\n")[0].trim(); } catch {}
  let status = version ? "ok" : t.required ? "MISSING" : "absent (optional)";
  if (version && t.min) {
    const major = parseInt(version.replace(/^v/, ""), 10);
    if (major < t.min) status = `TOO OLD (need >= ${t.min})`;
  }
  if (t.required && status !== "ok") missingRequired++;
  return { tool: t.name, status, version: version ?? "-", neededFor: t.why };
});

console.table(rows);
let ghAuth = "unknown";
try { execSync("gh auth status", { stdio: "ignore" }); ghAuth = "logged in"; } catch { ghAuth = "NOT logged in (run: gh auth login)"; }
console.log(`gh auth: ${ghAuth}`);
console.log(`platform: ${process.platform} ${process.arch}`);
process.exit(missingRequired ? 1 : 0);
