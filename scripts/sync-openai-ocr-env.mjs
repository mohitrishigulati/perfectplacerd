/**
 * Sync OpenAI OCR env to Vercel (server-only). Never prints secret values.
 * Requires OPENAI_API_KEY in .env.local (Platform API key, not ChatGPT login).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");
const TARGETS = ["production", "preview", "development"];

function parseEnvFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i === -1) continue;
    env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

function syncVar(name, value, target) {
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(
    npxCommand,
    ["vercel", "env", "add", name, target, "--force", "--yes"],
    {
      cwd: ROOT,
      input: value,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      shell: false,
    },
  );
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const combined = `${stdout}\n${stderr}`;
  if (result.status !== 0 && !/Overrode|Added|Saving|Updated/i.test(combined)) {
    console.error(`Failed ${name} (${target}): exit ${result.status}`);
    process.exit(result.status ?? 1);
  }
  console.log(`Synced ${name} -> ${target}`);
}

if (!fs.existsSync(ENV_FILE)) {
  console.error("Missing .env.local - add OPENAI_API_KEY there first.");
  process.exit(1);
}

const env = parseEnvFile(ENV_FILE);
const apiKey = env.OPENAI_API_KEY?.trim();
if (!apiKey || apiKey.startsWith("your-") || apiKey.includes("<")) {
  console.error(
    "Set OPENAI_API_KEY in .env.local (Platform API key), then re-run this script.",
  );
  process.exit(1);
}

for (const target of TARGETS) {
  syncVar("RESUME_OCR_PROVIDER", "openai", target);
  syncVar("OPENAI_API_KEY", apiKey, target);
}

console.log("OpenAI OCR variables synced to Vercel. Redeploy production to apply.");
