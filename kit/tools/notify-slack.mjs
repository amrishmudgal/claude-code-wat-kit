#!/usr/bin/env node
// Posts one message to Slack. The tool reads the webhook from the environment or .env.local; the agent never sees it.
// Usage: node tools/notify-slack.mjs "Preview ready for phase 2"
import { readFileSync, existsSync } from "node:fs";

let url = process.env.SLACK_WEBHOOK_URL;
if (!url && existsSync(".env.local")) {
  const m = readFileSync(".env.local", "utf8").match(/^\s*SLACK_WEBHOOK_URL\s*=\s*["']?([^"'\s#]+)/m);
  if (m) url = m[1];
}
const text = process.argv.slice(2).join(" ").trim();
if (!text) { console.error('Usage: node tools/notify-slack.mjs "message"'); process.exit(1); }
if (!url) { console.log("SLACK_WEBHOOK_URL not set. Skipping notification."); process.exit(0); }

const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
console.log(res.ok ? "Slack: sent" : `Slack: failed with HTTP ${res.status}`);
process.exit(res.ok ? 0 : 1);
