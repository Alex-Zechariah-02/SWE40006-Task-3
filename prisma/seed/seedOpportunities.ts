import type { PrismaClient } from "@prisma/client";

import { dateUtcNoon, kualaLumpurTime } from "./utils";
import { upsertOpportunity } from "./upsertCompanyAndOpportunity";

export async function seedOpportunities(
  prisma: PrismaClient,
  params: {
    userId: string;
    companyByName: Map<string, { id: string; name: string }>;
  }
) {
  const userId = params.userId;
  const companyByName = params.companyByName;

  const seedArchiveAt = kualaLumpurTime("2026-04-02T12:00:00+08:00");

  const oppIntel = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("Intel Malaysia")!.id,
    title: "Software Engineering Intern",
    opportunityType: "Internship",
    remoteMode: "OnSite",
    location: "Penang",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/intel-software-engineering-intern-penang",
    stage: "Saved",
    deadline: dateUtcNoon(2026, 4, 18),
    tags: ["internship", "engineering"],
    archivedAt: null,
    importedAt: kualaLumpurTime("2026-03-28T09:00:00+08:00"),
  });

  await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("SanDisk")!.id,
    title: "Firmware Validation Intern",
    opportunityType: "Internship",
    remoteMode: "OnSite",
    location: "Penang",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/sandisk-firmware-validation-intern-penang",
    stage: "Shortlisted",
    deadline: dateUtcNoon(2026, 4, 21),
    tags: ["internship", "firmware", "validation"],
    archivedAt: null,
    importedAt: kualaLumpurTime("2026-03-28T09:05:00+08:00"),
  });

  await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("PETRONAS Digital")!.id,
    title: "Graduate Technology Programme",
    opportunityType: "GraduateProgram",
    remoteMode: "Hybrid",
    location: "Kuala Lumpur",
    sourceType: "Manual",
    sourceProvider: "manual",
    sourceUrl: undefined,
    stage: "Shortlisted",
    deadline: dateUtcNoon(2026, 4, 25),
    tags: ["graduate", "technology"],
    archivedAt: null,
    importedAt: null,
  });

  await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("Atlassian")!.id,
    title: "Associate Software Engineer",
    opportunityType: "FullTime",
    remoteMode: "Remote",
    location: "Remote APAC",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/atlassian-associate-software-engineer-remote-apac",
    stage: "Saved",
    deadline: dateUtcNoon(2026, 4, 27),
    tags: ["backend", "full-time"],
    archivedAt: null,
    importedAt: kualaLumpurTime("2026-03-28T09:10:00+08:00"),
  });

  // Converted to active applications (archived from opportunity queue)
  const oppAmd = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("AMD")!.id,
    title: "Software Validation Intern",
    opportunityType: "Internship",
    remoteMode: "OnSite",
    location: "Penang",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/amd-software-validation-intern-penang",
    stage: "Shortlisted",
    deadline: undefined,
    tags: ["internship", "validation"],
    archivedAt: seedArchiveAt,
    importedAt: kualaLumpurTime("2026-03-26T10:30:00+08:00"),
  });

  const oppShell = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("Shell")!.id,
    title: "Graduate Programme, Data & Analytics",
    opportunityType: "GraduateProgram",
    remoteMode: "Hybrid",
    location: "Kuala Lumpur",
    sourceType: "Manual",
    sourceProvider: "manual",
    sourceUrl: undefined,
    stage: "Shortlisted",
    tags: ["graduate", "data"],
    archivedAt: seedArchiveAt,
    importedAt: null,
  });

  const oppKeysight = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("Keysight")!.id,
    title: "Associate Software Engineer",
    opportunityType: "FullTime",
    remoteMode: "OnSite",
    location: "Penang",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/keysight-associate-software-engineer-penang",
    stage: "Shortlisted",
    tags: ["full-time", "software"],
    archivedAt: seedArchiveAt,
    importedAt: kualaLumpurTime("2026-03-26T09:00:00+08:00"),
  });

  const oppMotorola = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("Motorola Solutions")!.id,
    title: "Software Test Engineer Graduate",
    opportunityType: "FullTime",
    remoteMode: "OnSite",
    location: "Penang",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/motorola-software-test-engineer-graduate-penang",
    stage: "Shortlisted",
    tags: ["testing", "full-time"],
    archivedAt: seedArchiveAt,
    importedAt: kualaLumpurTime("2026-03-27T09:00:00+08:00"),
  });

  const oppAirAsia = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("AirAsia MOVE")!.id,
    title: "Junior Backend Engineer",
    opportunityType: "FullTime",
    remoteMode: "Hybrid",
    location: "Kuala Lumpur",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/airasia-move-junior-backend-engineer-kuala-lumpur",
    stage: "Shortlisted",
    tags: ["backend", "full-time"],
    archivedAt: seedArchiveAt,
    importedAt: kualaLumpurTime("2026-03-31T09:00:00+08:00"),
  });

  // Closed outcomes (archived from opportunity queue)
  const oppDell = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("Dell Technologies")!.id,
    title: "Associate Software Engineer",
    opportunityType: "FullTime",
    remoteMode: "Hybrid",
    location: "Cyberjaya",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/dell-technologies-associate-software-engineer-cyberjaya",
    stage: "Shortlisted",
    tags: ["full-time"],
    archivedAt: seedArchiveAt,
    importedAt: kualaLumpurTime("2026-03-30T09:00:00+08:00"),
  });

  const oppHuawei = await upsertOpportunity(prisma, {
    userId,
    companyId: companyByName.get("Huawei")!.id,
    title: "Cloud Engineer Graduate",
    opportunityType: "FullTime",
    remoteMode: "OnSite",
    location: "Kuala Lumpur",
    sourceType: "Imported",
    sourceProvider: "linkup",
    sourceUrl: "https://linkup.example/jobs/huawei-cloud-engineer-graduate-kuala-lumpur",
    stage: "Shortlisted",
    tags: ["cloud", "graduate"],
    archivedAt: seedArchiveAt,
    importedAt: kualaLumpurTime("2026-03-30T10:00:00+08:00"),
  });

  return {
    oppIntel,
    oppAmd,
    oppShell,
    oppKeysight,
    oppMotorola,
    oppAirAsia,
    oppDell,
    oppHuawei,
  };
}
