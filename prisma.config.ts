import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

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

function loadEnvFile(
  filePath: string,
  initialKeys: Set<string>,
  keysSetByEnvFiles: Set<string>
) {
  if (!fs.existsSync(filePath)) return;

  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const parsed = parseEnvLine(rawLine);
    if (!parsed) continue;

    const alreadySet = Object.prototype.hasOwnProperty.call(
      process.env,
      parsed.key
    );
    const setByFile = keysSetByEnvFiles.has(parsed.key);
    const canOverride = setByFile && !initialKeys.has(parsed.key);

    if (!alreadySet || canOverride) {
      process.env[parsed.key] = parsed.value;
      keysSetByEnvFiles.add(parsed.key);
    }
  }
}

const initialKeys = new Set(Object.keys(process.env));
const keysSetByEnvFiles = new Set<string>();

// Local precedence:
// - OS env wins (never overridden)
// - .env.local overrides .env
loadEnvFile(path.join(process.cwd(), ".env"), initialKeys, keysSetByEnvFiles);
loadEnvFile(
  path.join(process.cwd(), ".env.local"),
  initialKeys,
  keysSetByEnvFiles
);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    ...(process.env["SHADOW_DATABASE_URL"]
      ? { shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"] }
      : {}),
  },
});
