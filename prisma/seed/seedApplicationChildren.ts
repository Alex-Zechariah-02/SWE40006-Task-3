import type { PrismaClient } from "@prisma/client";

import { dateUtcNoon, kualaLumpurTime } from "./utils";
import {
  upsertActionItem,
  upsertContact,
  upsertInterview,
} from "./upsertApplicationWorkflow";

export async function seedApplicationChildren(
  prisma: PrismaClient,
  params: {
    userId: string;
    companyByName: Map<string, { id: string; name: string }>;
    oppIntel: { id: string };
    apps: {
      appAmd: { id: string };
      appShell: { id: string };
      appKeysight: { id: string };
      appMotorola: { id: string };
      appDell: { id: string };
      appHuawei: { id: string };
    };
  }
) {
  const userId = params.userId;
  const companyByName = params.companyByName;
  const apps = params.apps;

  // Contacts
  await upsertContact(prisma, {
    companyId: companyByName.get("Intel Malaysia")!.id,
    name: "Sarah Lim",
    title: "University Relations Recruiter",
    email: "sarah.lim@intel.example",
  });

  const contactAmd = await upsertContact(prisma, {
    companyId: companyByName.get("AMD")!.id,
    name: "Daniel Wong",
    title: "Talent Acquisition Specialist",
    email: "daniel.wong@amd.example",
  });

  await upsertContact(prisma, {
    companyId: companyByName.get("PETRONAS Digital")!.id,
    name: "Nur Aisyah Rahman",
    title: "Graduate Hiring Coordinator",
    email: "nur.aisyah@petronas.example",
  });

  const contactShell = await upsertContact(prisma, {
    companyId: companyByName.get("Shell")!.id,
    name: "Priya Nair",
    title: "Campus and Graduate Recruiter",
    email: "priya.nair@shell.example",
  });

  // Link contacts to applications (canonical seed relationships)
  await prisma.application.update({
    where: { id: apps.appAmd.id },
    data: {
      contacts: {
        set: [{ id: contactAmd.id }],
      },
    },
  });

  await prisma.application.update({
    where: { id: apps.appShell.id },
    data: {
      contacts: {
        set: [{ id: contactShell.id }],
      },
    },
  });

  // Interviews (4)
  const interviewKeysightRecruiter = await upsertInterview(prisma, {
    applicationId: apps.appKeysight.id,
    interviewType: "RecruiterScreen",
    scheduledAt: kualaLumpurTime("2026-04-08T10:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Keysight (Recruiter call)",
  });

  await upsertInterview(prisma, {
    applicationId: apps.appKeysight.id,
    interviewType: "TechnicalInterview",
    scheduledAt: kualaLumpurTime("2026-04-11T14:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Keysight (Technical interview)",
  });

  await upsertInterview(prisma, {
    applicationId: apps.appMotorola.id,
    interviewType: "HRScreen",
    scheduledAt: kualaLumpurTime("2026-04-09T15:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Motorola (HR screen)",
  });

  await upsertInterview(prisma, {
    applicationId: apps.appMotorola.id,
    interviewType: "FinalInterview",
    scheduledAt: kualaLumpurTime("2026-04-15T11:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Motorola (Final interview)",
  });

  // Action items (7) with 3 overdue open items (Follow-ups Due = 3)
  await upsertActionItem(prisma, {
    userId,
    title: "Tailor resume for Intel internship",
    dueAt: kualaLumpurTime("2026-04-05T09:00:00+08:00"),
    priority: "High",
    status: "Open",
    companyId: companyByName.get("Intel Malaysia")!.id,
    opportunityId: params.oppIntel.id,
  });

  await upsertActionItem(prisma, {
    userId,
    title: "Follow up AMD application",
    dueAt: kualaLumpurTime("2026-04-06T09:00:00+08:00"),
    priority: "High",
    status: "Open",
    companyId: companyByName.get("AMD")!.id,
    applicationId: apps.appAmd.id,
  });

  await upsertActionItem(prisma, {
    userId,
    title: "Complete Shell online assessment",
    dueAt: kualaLumpurTime("2026-04-07T09:00:00+08:00"),
    priority: "High",
    status: "InProgress",
    companyId: companyByName.get("Shell")!.id,
    applicationId: apps.appShell.id,
  });

  await upsertActionItem(prisma, {
    userId,
    title: "Prepare STAR examples for Keysight interview",
    dueAt: kualaLumpurTime("2026-04-08T09:00:00+08:00"),
    priority: "Medium",
    status: "Completed",
    companyId: companyByName.get("Keysight")!.id,
    applicationId: apps.appKeysight.id,
    interviewId: interviewKeysightRecruiter.id,
  });

  await upsertActionItem(prisma, {
    userId,
    title: "Research Motorola product lines",
    dueAt: kualaLumpurTime("2026-04-09T09:00:00+08:00"),
    priority: "Medium",
    status: "Completed",
    companyId: companyByName.get("Motorola Solutions")!.id,
    applicationId: apps.appMotorola.id,
  });

  await upsertActionItem(prisma, {
    userId,
    title: "Compare Dell offer package",
    dueAt: kualaLumpurTime("2026-04-10T09:00:00+08:00"),
    priority: "Medium",
    status: "Completed",
    companyId: companyByName.get("Dell Technologies")!.id,
    applicationId: apps.appDell.id,
  });

  await upsertActionItem(prisma, {
    userId,
    title: "Capture lessons learned from Huawei rejection",
    dueAt: kualaLumpurTime("2026-04-04T09:00:00+08:00"),
    priority: "Low",
    status: "Completed",
    companyId: companyByName.get("Huawei")!.id,
    applicationId: apps.appHuawei.id,
  });

  // Offer + rejection details
  await prisma.offerDetail.upsert({
    where: { applicationId: apps.appDell.id },
    update: {
      offeredDate: dateUtcNoon(2026, 3, 31),
      compensationNote: "RM 4,800 monthly",
      responseDeadline: dateUtcNoon(2026, 4, 12),
      decisionStatus: "Pending",
      notes: "Graduate entry role, hybrid, Cyberjaya",
    },
    create: {
      applicationId: apps.appDell.id,
      offeredDate: dateUtcNoon(2026, 3, 31),
      compensationNote: "RM 4,800 monthly",
      responseDeadline: dateUtcNoon(2026, 4, 12),
      decisionStatus: "Pending",
      notes: "Graduate entry role, hybrid, Cyberjaya",
    },
  });

  await prisma.rejectionDetail.upsert({
    where: { applicationId: apps.appHuawei.id },
    update: {
      rejectionDate: dateUtcNoon(2026, 4, 1),
      rejectedAtStage: "Assessment",
      notes: "Stronger cloud certification background was likely expected",
    },
    create: {
      applicationId: apps.appHuawei.id,
      rejectionDate: dateUtcNoon(2026, 4, 1),
      rejectedAtStage: "Assessment",
      notes: "Stronger cloud certification background was likely expected",
    },
  });

  // Final sanity counts (fast signals, not a replacement for UI verification)
  const [
    companyCount,
    opportunityCount,
    applicationCount,
    interviewCount,
    actionItemCount,
    contactCount,
  ] = await Promise.all([
    prisma.company.count({ where: { userId } }),
    prisma.opportunity.count({ where: { userId } }),
    prisma.application.count({ where: { userId } }),
    prisma.interview.count({ where: { application: { userId } } }),
    prisma.actionItem.count({ where: { userId } }),
    prisma.contact.count({ where: { company: { userId } } }),
  ]);

  console.log("Seeded counts:", {
    companies: companyCount,
    opportunities: opportunityCount,
    applications: applicationCount,
    interviews: interviewCount,
    actionItems: actionItemCount,
    contacts: contactCount,
  });
}
