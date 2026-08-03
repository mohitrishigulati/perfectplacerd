import net from "node:net";
import { spawn, execSync } from "node:child_process";

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Could not resolve free port"));
        return;
      }
      const port = address.port;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
    server.on("error", reject);
  });
}

async function main() {
  const port = await getFreePort();
  process.env.PLAYWRIGHT_PORT = String(port);

  execSync("npm run build", { stdio: "inherit" });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk5NTAzNzIsImV4cCI6MTk2NTUyNjM3Mn0.e2e-test-signature";

  let server = null;

  const shutdown = () => {
    if (server && !server.killed) {
      server.kill("SIGTERM");
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise((resolve, reject) => {
    server = spawn("npm", ["run", "start", "--", "-p", String(port)], {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
      },
    });

    server.on("error", reject);

    const started = Date.now();
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/`);
        if (response.ok || response.status === 404) {
          clearInterval(interval);
          resolve();
        }
      } catch {
        if (Date.now() - started > 120_000) {
          clearInterval(interval);
          reject(new Error("Timed out waiting for Next.js server"));
        }
      }
    }, 500);
  });

  try {
    execSync("npx playwright test", {
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_PORT: String(port),
        PLAYWRIGHT_SKIP_WEBSERVER: "1",
        CI: process.env.CI ?? "1",
      },
    });
  } finally {
    shutdown();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
