import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

const envText = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;
  const i = line.indexOf("=");
  env[line.slice(0, i)] = line.slice(i + 1).replace(/^"|"$/g, "");
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const { data, error } = await createClient(url, key).auth.signInWithOtp({
  email: `otp.smoke.${Date.now()}@gmail.com`,
  options: {
    shouldCreateUser: true,
    emailRedirectTo: "https://perfect-placer-v2.vercel.app/auth/callback",
  },
});

console.log("error:", error?.message ?? null);
console.log("data:", JSON.stringify(data));
