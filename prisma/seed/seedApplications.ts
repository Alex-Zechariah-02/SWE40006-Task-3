import type { PrismaClient } from "@prisma/client";

import { dateUtcNoon } from "./utils";
import { upsertApplication } from "./upsertApplicationWorkflow";

export async function seedApplications(
  prisma: PrismaClient,
  params: {
    userId: string;
    companyByName: Map<string, { id: string; name: string }>;
    opps: {
      oppAmd: { id: string };
      oppShell: { id: string };
      oppKeysight: { id: string };
      oppMotorola: { id: string };
      oppAirAsia: { id: string };
      oppDell: { id: string };
      oppHuawei: { id: string };
    };
  }
) {
  const userId = params.userId;
  const companyByName = params.companyByName;
  const opps = params.opps;

  // Applications (5 active + 2 closed outcomes)
  const appAmd = await upsertApplication(prisma, {
    userId,
    opportunityId: opps.oppAmd.id,
    companyId: companyByName.get("AMD")!.id,
    currentStage: "Applied",
    appliedDate: dateUtcNoon(2026, 3, 29),
    priority: "High",
    tags: ["validation"],
  });

  const appShell = await upsertApplication(prisma, {
    userId,
    opportunityId: opps.oppShell.id,
    companyId: companyByName.get("Shell")!.id,
    currentStage: "Assessment",
    appliedDate: dateUtcNoon(2026, 3, 30),
    priority: "High",
    tags: ["data"],
  });

  const appKeysight = await upsertApplication(prisma, {
    userId,
    opportunityId: opps.oppKeysight.id,
    companyId: companyByName.get("Keysight")!.id,
    currentStage: "Interview",
    appliedDate: dateUtcNoon(2026, 3, 26),
    priority: "High",
    tags: ["interview"],
  });

  const appMotorola = await upsertApplication(prisma, {
    userId,
    opportunityId: opps.oppMotorola.id,
    companyId: companyByName.get("Motorola Solutions")!.id,
    currentStage: "Interview",
    appliedDate: dateUtcNoon(2026, 3, 27),
    priority: "Medium",
    tags: ["interview"],
  });

  await upsertApplication(prisma, {
    userId,
    opportunityId: opps.oppAirAsia.id,
    companyId: companyByName.get("AirAsia MOVE")!.id,
    currentStage: "Applied",
    appliedDate: dateUtcNoon(2026, 3, 31),
    priority: "Medium",
    tags: ["backend"],
  });

  const appDell = await upsertApplication(prisma, {
    userId,
    opportunityId: opps.oppDell.id,
    companyId: companyByName.get("Dell Technologies")!.id,
    currentStage: "Offer",
    appliedDate: dateUtcNoon(2026, 3, 31),
    priority: "High",
    tags: ["offer"],
  });

  const appHuawei = await upsertApplication(prisma, {
    userId,
    opportunityId: opps.oppHuawei.id,
    companyId: companyByName.get("Huawei")!.id,
    currentStage: "Rejected",
    appliedDate: dateUtcNoon(2026, 4, 1),
    priority: "Medium",
    tags: ["rejected"],
  });

  return { appAmd, appShell, appKeysight, appMotorola, appDell, appHuawei };
}
