import type { PrismaClient } from "@prisma/client";

import { upsertBlankUser, upsertDemoUser, upsertE2EUser } from "./upsertUsers";

export async function seedUsers(prisma: PrismaClient): Promise<{ userId: string }> {
  // Keep accounts separated:
  // - demo@... holds the canonical dataset for screenshots and manual review
  // - blank@... stays empty for uncluttered manual testing
  // - e2e@... is used by Playwright so the demo account is not polluted by E2E-created records
  await upsertBlankUser(prisma);
  await upsertE2EUser(prisma);
  const demoUser = await upsertDemoUser(prisma);

  return { userId: demoUser.id };
}

