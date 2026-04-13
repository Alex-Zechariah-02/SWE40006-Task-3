import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Pool } from "pg";

function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const eqIndex = trimmed.indexOf("=");
  if (eqIndex <= 0) return null;

  const key = trimmed.slice(0, eqIndex).trim();
  if (!key) return null;

  let value = trimmed.slice(eqIndex + 1).trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const parsed = parseEnvLine(rawLine);
    if (!parsed) continue;
    if (Object.prototype.hasOwnProperty.call(process.env, parsed.key)) continue;
    process.env[parsed.key] = parsed.value;
  }
}

function loadLocalEnv() {
  // Match Next/Prisma local expectations: .env.local overrides .env, but OS env always wins.
  loadEnvFile(path.join(process.cwd(), ".env"));
  loadEnvFile(path.join(process.cwd(), ".env.local"));
}

function readFlagValue(argv: string[], flag: string): string | null {
  const idx = argv.indexOf(flag);
  if (idx === -1) return null;
  return argv[idx + 1] ?? null;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function resolvePort(): number {
  const fromArgs = readFlagValue(process.argv, "--port");
  const raw = fromArgs ?? process.env.PORT ?? "3000";
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid port: ${raw}`);
  }
  return parsed;
}

function buildDatabaseUrlForSchema(base: string, schema: string): string {
  const url = new URL(base);
  url.searchParams.set("schema", schema);
  return url.toString();
}

function stripSchemaParam(input: string): string {
  try {
    const url = new URL(input);
    url.searchParams.delete("schema");
    return url.toString();
  } catch {
    return input;
  }
}

async function ensureSchemaExists(params: {
  connectionString: string;
  schema: string;
}) {
  const pool = new Pool({
    connectionString: stripSchemaParam(params.connectionString),
  });

  try {
    await pool.query(`CREATE SCHEMA IF NOT EXISTS "${params.schema}"`);
  } finally {
    await pool.end();
  }
}

function resolvePnpmCmd(): string {
  return "pnpm";
}

function spawnProcess(
  command: string,
  args: string[],
  opts: { stdio: "inherit"; env: NodeJS.ProcessEnv }
) {
  if (process.platform === "win32") {
    // Windows batch shims (pnpm.cmd) require a cmd.exe trampoline when spawned from Node.
    return spawn("cmd.exe", ["/d", "/s", "/c", command, ...args], {
      stdio: opts.stdio,
      env: opts.env,
    });
  }

  return spawn(command, args, {
    stdio: opts.stdio,
    env: opts.env,
  });
}

function resolveNextBin(): string {
  const candidate = path.join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
  if (!fs.existsSync(candidate)) {
    throw new Error(`next bin not found at ${candidate}`);
  }
  return candidate;
}

function resolveStandaloneServer(): string | null {
  const candidate = path.join(process.cwd(), ".next", "standalone", "server.js");
  return fs.existsSync(candidate) ? candidate : null;
}

function ensureStandaloneAssets() {
  const rootDir = process.cwd();
  const standaloneDir = path.join(rootDir, ".next", "standalone");

  // When running the standalone server, Next expects assets relative to the
  // standalone directory:
  // - .next/static -> .next/standalone/.next/static
  // - public/      -> .next/standalone/public
  const staticSrc = path.join(rootDir, ".next", "static");
  const staticDest = path.join(standaloneDir, ".next", "static");
  if (fs.existsSync(staticSrc)) {
    fs.mkdirSync(path.dirname(staticDest), { recursive: true });
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
  }

  const publicSrc = path.join(rootDir, "public");
  const publicDest = path.join(standaloneDir, "public");
  if (fs.existsSync(publicSrc)) {
    fs.mkdirSync(standaloneDir, { recursive: true });
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
  }
}

async function runCmd(
  command: string,
  args: string[],
  opts: { env?: NodeJS.ProcessEnv } = {}
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawnProcess(command, args, {
      stdio: "inherit",
      env: { ...process.env, ...opts.env },
    });
    child.on("exit", (code: number | null) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed (code ${code ?? "null"})`));
    });
    child.on("error", reject);
  });
}

async function main() {
  loadLocalEnv();

  const port = resolvePort();
  const baseDatabaseUrl = requireEnv("DATABASE_URL");

  const schema = process.env.E2E_SCHEMA?.trim() || "careerdeck_e2e";
  const e2eDatabaseUrl =
    process.env.E2E_DATABASE_URL?.trim() ||
    buildDatabaseUrlForSchema(baseDatabaseUrl, schema);

  await ensureSchemaExists({ connectionString: baseDatabaseUrl, schema });

  const pnpm = resolvePnpmCmd();
  const envForDb: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? "test",
    DATABASE_URL: e2eDatabaseUrl,
  };

  // Ensure `next start` reflects the current workspace. Without a build step here,
  // `pnpm test:e2e` can unintentionally run against a stale `.next` output.
  await runCmd(pnpm, ["run", "build"], {
    env: {
      ...envForDb,
      NODE_ENV: "production",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  });

  // Deterministic E2E boot: migrate + seed before starting the server.
  await runCmd(pnpm, ["run", "prisma:deploy"], { env: envForDb });
  await runCmd(pnpm, ["run", "prisma:seed"], { env: envForDb });

  const envForServer: NodeJS.ProcessEnv = {
    ...envForDb,
    NODE_ENV: "production",
    NEXT_TELEMETRY_DISABLED: "1",
    PORT: String(port),
  };

  const standaloneServer = resolveStandaloneServer();
  if (standaloneServer) {
    ensureStandaloneAssets();
  }

  const serverArgs = standaloneServer
    ? [standaloneServer]
    : [resolveNextBin(), "start", "-p", String(port)];

  const server = spawn(process.execPath, serverArgs, {
    stdio: "inherit",
    env: envForServer,
  });

  const shutdown = (signal: NodeJS.Signals) => {
    if (!server.killed) {
      server.kill(signal);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise<void>((resolve, reject) => {
    server.on("exit", (code: number | null) => {
      if (code === 0) resolve();
      else reject(new Error(`Server exited (code ${code ?? "null"})`));
    });
    server.on("error", reject);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
