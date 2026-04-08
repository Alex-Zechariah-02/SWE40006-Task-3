import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

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

function loadEnvFile(filePath: string, initialKeys: Set<string>) {
  if (!fs.existsSync(filePath)) return;
  const contents = fs.readFileSync(filePath, "utf8");
  for (const rawLine of contents.split(/\r?\n/)) {
    const parsed = parseEnvLine(rawLine);
    if (!parsed) continue;
    if (initialKeys.has(parsed.key)) continue;
    if (Object.prototype.hasOwnProperty.call(process.env, parsed.key)) continue;
    process.env[parsed.key] = parsed.value;
  }
}

function loadLocalEnv() {
  const initialKeys = new Set(Object.keys(process.env));
  loadEnvFile(path.join(process.cwd(), ".env"), initialKeys);
  loadEnvFile(path.join(process.cwd(), ".env.local"), initialKeys);
}

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply") || argv.includes("--yes");
  const allowPublicSchema = argv.includes("--allow-public-schema");
  return { apply, allowPublicSchema };
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function getSchemaFromUrl(databaseUrl: string): string | null {
  try {
    const url = new URL(databaseUrl);
    return url.searchParams.get("schema");
  } catch {
    return null;
  }
}

async function main() {
  loadLocalEnv();
  const args = parseArgs(process.argv.slice(2));

  const databaseUrl = requireEnv("DATABASE_URL");
  const schema = getSchemaFromUrl(databaseUrl) ?? "public";

  if (schema === "public" && !args.allowPublicSchema) {
    throw new Error(
      [
        "Refusing to clean schema=public by default.",
        "This protects your real dev data.",
        "If you are sure, rerun with `--allow-public-schema`.",
        "Example: `pnpm db:cleanup:e2e -- --allow-public-schema --apply`",
      ].join(" ")
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const e2eTitlePrefix = "E2E ";
  const e2eTag = "e2e";

  try {
    const opportunities = await prisma.opportunity.findMany({
      where: {
        OR: [
          { title: { startsWith: e2eTitlePrefix } },
          { tags: { has: e2eTag } },
        ],
      },
      select: { id: true },
    });
    const opportunityIds = opportunities.map((o) => o.id);

    const applications = await prisma.application.findMany({
      where: {
        OR: [
          { tags: { has: e2eTag } },
          opportunityIds.length > 0
            ? { opportunityId: { in: opportunityIds } }
            : undefined,
          { opportunity: { title: { startsWith: e2eTitlePrefix } } },
        ].filter(Boolean) as Array<Record<string, unknown>>,
      },
      select: { id: true },
    });
    const applicationIds = applications.map((a) => a.id);

    const companies = await prisma.company.findMany({
      where: { name: { startsWith: e2eTitlePrefix } },
      select: { id: true },
    });
    const companyIds = companies.map((c) => c.id);

    const contacts = await prisma.contact.findMany({
      where: {
        OR: [
          { name: { startsWith: e2eTitlePrefix } },
          { email: { startsWith: "e2e-" } },
        ],
      },
      select: { id: true },
    });
    const contactIds = contacts.map((c) => c.id);

    const actionItemWhere = {
      OR: [
        { title: { startsWith: e2eTitlePrefix } },
        opportunityIds.length > 0
          ? { opportunityId: { in: opportunityIds } }
          : undefined,
        applicationIds.length > 0
          ? { applicationId: { in: applicationIds } }
          : undefined,
        companyIds.length > 0 ? { companyId: { in: companyIds } } : undefined,
      ].filter(Boolean) as Array<Record<string, unknown>>,
    };

    const counts = {
      schema,
      candidates: {
        opportunities: opportunityIds.length,
        applications: applicationIds.length,
        companies: companyIds.length,
        contacts: contactIds.length,
      },
    };

    if (!args.apply) {
      console.log(
        JSON.stringify(
          {
            mode: "dry-run",
            note: "No deletes performed. Re-run with --apply to delete.",
            ...counts,
          },
          null,
          2
        )
      );
      return;
    }

    const deletedActionItems = await prisma.actionItem.deleteMany({
      where: actionItemWhere as never,
    });

    const deletedApplications = await prisma.application.deleteMany({
      where: { id: { in: applicationIds } },
    });

    const deletedOpportunities = await prisma.opportunity.deleteMany({
      where: { id: { in: opportunityIds } },
    });

    const deletedContacts = await prisma.contact.deleteMany({
      where: { id: { in: contactIds } },
    });

    const deletedCompanies = await prisma.company.deleteMany({
      where: {
        id: { in: companyIds },
        opportunities: { none: {} },
        applications: { none: {} },
        contacts: { none: {} },
      },
    });

    console.log(
      JSON.stringify(
        {
          mode: "apply",
          ...counts,
          deleted: {
            actionItems: deletedActionItems.count,
            applications: deletedApplications.count,
            opportunities: deletedOpportunities.count,
            contacts: deletedContacts.count,
            companies: deletedCompanies.count,
          },
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect().catch(() => null);
    await pool.end().catch(() => null);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

