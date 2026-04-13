import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

export type SeedRuntime = {
  prisma: PrismaClient;
  pool: Pool;
};

export function createSeedRuntime(): SeedRuntime {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for prisma seed.");
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  return { prisma, pool };
}

export async function disposeSeedRuntime(runtime: SeedRuntime) {
  await runtime.prisma.$disconnect();
  await runtime.pool.end();
}

