import type { PrismaClient } from "@prisma/client";

import { seedApplications } from "./seedApplications";
import { seedApplicationChildren } from "./seedApplicationChildren";
import { seedCompanies } from "./seedCompanies";
import { seedOpportunities } from "./seedOpportunities";
import { seedUsers } from "./seedUsers";

export async function runSeed(prisma: PrismaClient) {
  console.log("Seeding CareerDeck demo dataset (idempotent).");
  console.log(
    "Safety: do not reseed production on every deploy; run only for initial population or controlled refresh."
  );

  const { userId } = await seedUsers(prisma);
  const companyByName = await seedCompanies(prisma, { userId });

  const opps = await seedOpportunities(prisma, { userId, companyByName });
  const apps = await seedApplications(prisma, { userId, companyByName, opps });

  await seedApplicationChildren(prisma, {
    userId,
    companyByName,
    oppIntel: opps.oppIntel,
    apps,
  });
}

