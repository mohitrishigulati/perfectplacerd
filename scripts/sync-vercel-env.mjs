import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENV_FILE = path.join(ROOT, ".env.local");
const KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
];
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
  const result = spawnSync(
    "npx",
    ["vercel", "env", "add", name, target, "--force", "--yes"],
    {
      cwd: ROOT,
      input: value,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    },
  );
  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const combined = `${stdout}\n${stderr}`;
  if (result.status !== 0 && !/Overrode|Added|Saving|Updated/i.test(combined)) {
    console.error(`Failed ${name} (${target}): exit ${result.status}`);
    process.exit(result.status ?? 1);
  }
  console.log(`Synced ${name} → ${target}`);
}

const env = parseEnvFile(ENV_FILE);
for (const key of KEYS) {
  const value = env[key];
  if (!value || value.startsWith("YOUR_")) {
    console.error(`Missing or placeholder: ${key}`);
    process.exit(1);
  }
}

for (const target of TARGETS) {
  for (const key of KEYS) {
    syncVar(key, env[key], target);
  }
}

console.log("All environment variables synced.");
