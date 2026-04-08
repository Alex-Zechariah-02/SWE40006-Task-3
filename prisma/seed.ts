import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { compare, hash } from "bcryptjs";

import { normalizeCompanyName } from "../src/lib/db/normalize";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for prisma seed.");
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function canonicalizeUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return input.trim();
  }

  url.hash = "";

  const toDelete: string[] = [];
  url.searchParams.forEach((_, key) => {
    if (key.toLowerCase().startsWith("utm_")) toDelete.push(key);
  });
  for (const key of toDelete) url.searchParams.delete(key);

  const normalizedPath = url.pathname.replace(/\/+$/, "");
  url.pathname = normalizedPath.length === 0 ? "/" : normalizedPath;

  return url.toString();
}

function computeDedupeKey(params: { provider: string; canonicalUrl: string }): string {
  return `${params.provider.toLowerCase()}:${params.canonicalUrl}`;
}

function computeManualDedupeKey(params: {
  title: string;
  companyName: string;
  location: string;
  opportunityType: string;
}): string {
  const normalized = [
    params.title.trim().toLowerCase(),
    params.companyName.trim().toLowerCase(),
    (params.location || "").trim().toLowerCase(),
    params.opportunityType.trim().toLowerCase(),
  ].join("|");

  let hashValue = 0;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    hashValue = ((hashValue << 5) - hashValue + ch) | 0;
  }
  const hex = (hashValue >>> 0).toString(16).padStart(8, "0");
  return `manual:${hex}`;
}

function dateUtcNoon(year: number, month1: number, day: number): Date {
  return new Date(Date.UTC(year, month1 - 1, day, 12, 0, 0));
}

function kualaLumpurTime(isoLocalWithOffset: string): Date {
  return new Date(isoLocalWithOffset);
}

async function upsertUser(params: { email: string; name: string; password: string }) {
  const email = params.email;
  const name = params.name;
  const password = params.password;
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, name: true },
  });

  if (!existing) {
    const passwordHash = await hash(password, 10);
    return prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: { id: true, email: true },
    });
  }

  const updates: { name?: string; passwordHash?: string } = {};
  if (existing.name !== name) updates.name = name;

  const ok = await compare(password, existing.passwordHash).catch(() => false);
  if (!ok) {
    updates.passwordHash = await hash(password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return { id: existing.id, email };
  }

  return prisma.user.update({
    where: { email },
    data: updates,
    select: { id: true, email: true },
  });
}

async function upsertDemoUser() {
  return upsertUser({
    email: "demo@careerdeck.test",
    name: "Alex Demo",
    password: "Demo123!",
  });
}

async function upsertBlankUser() {
  return upsertUser({
    email: "blank@careerdeck.test",
    name: "Alex Blank",
    password: "Blank123!",
  });
}

async function upsertE2EUser() {
  return upsertUser({
    email: "e2e@careerdeck.test",
    name: "Alex E2E",
    password: "E2E123!",
  });
}

async function upsertCompany(params: {
  userId: string;
  name: string;
  website?: string;
  location?: string;
  industry?: string;
  techStackNotes?: string;
  applicationProcessNotes?: string;
  interviewNotes?: string;
  compensationNotes?: string;
  generalNotes?: string;
}) {
  const parts = normalizeCompanyName(params.name);

  return prisma.company.upsert({
    where: {
      userId_normalizedName: {
        userId: params.userId,
        normalizedName: parts.normalizedName,
      },
    },
    update: {
      name: parts.name,
      website: params.website ?? null,
      location: params.location ?? null,
      industry: params.industry ?? null,
      techStackNotes: params.techStackNotes ?? null,
      applicationProcessNotes: params.applicationProcessNotes ?? null,
      interviewNotes: params.interviewNotes ?? null,
      compensationNotes: params.compensationNotes ?? null,
      generalNotes: params.generalNotes ?? null,
      archivedAt: null,
    },
    create: {
      userId: params.userId,
      name: parts.name,
      normalizedName: parts.normalizedName,
      website: params.website ?? null,
      location: params.location ?? null,
      industry: params.industry ?? null,
      techStackNotes: params.techStackNotes ?? null,
      applicationProcessNotes: params.applicationProcessNotes ?? null,
      interviewNotes: params.interviewNotes ?? null,
      compensationNotes: params.compensationNotes ?? null,
      generalNotes: params.generalNotes ?? null,
      archivedAt: null,
    },
    select: { id: true, name: true, normalizedName: true },
  });
}

async function upsertOpportunity(params: {
  userId: string;
  companyId: string;
  title: string;
  opportunityType:
    | "Internship"
    | "GraduateProgram"
    | "FullTime"
    | "PartTime"
    | "Contract";
  remoteMode: "OnSite" | "Hybrid" | "Remote";
  location?: string;
  sourceType: "Imported" | "Manual";
  sourceProvider: string;
  sourceUrl?: string;
  stage: "Saved" | "Shortlisted";
  deadline?: Date;
  tags?: string[];
  notes?: string;
  archivedAt?: Date | null;
  importedAt?: Date | null;
}) {
  const tags = params.tags ?? [];

  let dedupeKey: string;
  if (params.sourceType === "Imported" && params.sourceUrl) {
    const canonicalUrl = canonicalizeUrl(params.sourceUrl);
    dedupeKey = computeDedupeKey({
      provider: params.sourceProvider,
      canonicalUrl,
    });
  } else {
    const company = await prisma.company.findUnique({
      where: { id: params.companyId },
      select: { normalizedName: true },
    });
    const companyName = company?.normalizedName ?? "unknown";

    dedupeKey = computeManualDedupeKey({
      title: params.title,
      companyName,
      location: params.location ?? "",
      opportunityType: params.opportunityType,
    });
  }

  return prisma.opportunity.upsert({
    where: {
      userId_dedupeKey: {
        userId: params.userId,
        dedupeKey,
      },
    },
    update: {
      companyId: params.companyId,
      title: params.title,
      opportunityType: params.opportunityType,
      location: params.location ?? null,
      remoteMode: params.remoteMode,
      sourceType: params.sourceType,
      sourceUrl: params.sourceUrl ?? null,
      sourceProvider: params.sourceProvider,
      externalSourceId: null,
      snippet: null,
      description: null,
      stage: params.stage,
      deadline: params.deadline ?? null,
      tags,
      notes: params.notes ?? null,
      archivedAt: params.archivedAt ?? null,
      importedAt: params.importedAt ?? null,
      rawProviderPayload: undefined,
    },
    create: {
      userId: params.userId,
      companyId: params.companyId,
      title: params.title,
      opportunityType: params.opportunityType,
      location: params.location ?? null,
      remoteMode: params.remoteMode,
      sourceType: params.sourceType,
      sourceUrl: params.sourceUrl ?? null,
      sourceProvider: params.sourceProvider,
      externalSourceId: null,
      snippet: null,
      description: null,
      stage: params.stage,
      deadline: params.deadline ?? null,
      tags,
      notes: params.notes ?? null,
      dedupeKey,
      archivedAt: params.archivedAt ?? null,
      importedAt: params.importedAt ?? null,
      rawProviderPayload: undefined,
    },
    select: { id: true, title: true, archivedAt: true },
  });
}

async function upsertApplication(params: {
  userId: string;
  opportunityId: string;
  companyId: string;
  currentStage:
    | "Applied"
    | "Assessment"
    | "Interview"
    | "Offer"
    | "Rejected"
    | "Withdrawn";
  appliedDate?: Date | null;
  priority: "Low" | "Medium" | "High";
  tags?: string[];
  statusNotes?: string;
}) {
  return prisma.application.upsert({
    where: { opportunityId: params.opportunityId },
    update: {
      userId: params.userId,
      companyId: params.companyId,
      currentStage: params.currentStage,
      appliedDate: params.appliedDate ?? null,
      priority: params.priority,
      tags: params.tags ?? [],
      statusNotes: params.statusNotes ?? null,
      archivedAt: null,
    },
    create: {
      userId: params.userId,
      opportunityId: params.opportunityId,
      companyId: params.companyId,
      currentStage: params.currentStage,
      appliedDate: params.appliedDate ?? null,
      priority: params.priority,
      tags: params.tags ?? [],
      statusNotes: params.statusNotes ?? null,
      archivedAt: null,
    },
    select: { id: true, opportunityId: true, currentStage: true },
  });
}

async function upsertInterview(params: {
  applicationId: string;
  interviewType:
    | "RecruiterScreen"
    | "HRScreen"
    | "AssessmentReview"
    | "TechnicalInterview"
    | "FinalInterview"
    | "OfferDiscussion";
  scheduledAt: Date;
  status: string;
  locationOrLink?: string;
  notes?: string;
}) {
  const existing = await prisma.interview.findFirst({
    where: {
      applicationId: params.applicationId,
      interviewType: params.interviewType,
      scheduledAt: params.scheduledAt,
    },
    select: { id: true },
  });

  if (existing) {
    return prisma.interview.update({
      where: { id: existing.id },
      data: {
        status: params.status,
        locationOrLink: params.locationOrLink ?? null,
        notes: params.notes ?? null,
      },
      select: { id: true },
    });
  }

  return prisma.interview.create({
    data: {
      applicationId: params.applicationId,
      interviewType: params.interviewType,
      scheduledAt: params.scheduledAt,
      status: params.status,
      locationOrLink: params.locationOrLink ?? null,
      notes: params.notes ?? null,
    },
    select: { id: true },
  });
}

async function upsertContact(params: {
  companyId: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  notes?: string;
}) {
  return prisma.contact.upsert({
    where: {
      companyId_email: {
        companyId: params.companyId,
        email: params.email,
      },
    },
    update: {
      name: params.name,
      title: params.title ?? null,
      phone: params.phone ?? null,
      linkedinUrl: params.linkedinUrl ?? null,
      notes: params.notes ?? null,
    },
    create: {
      companyId: params.companyId,
      name: params.name,
      title: params.title ?? null,
      email: params.email,
      phone: params.phone ?? null,
      linkedinUrl: params.linkedinUrl ?? null,
      notes: params.notes ?? null,
    },
    select: { id: true, name: true },
  });
}

async function upsertActionItem(params: {
  userId: string;
  title: string;
  description?: string;
  dueAt?: Date | null;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "InProgress" | "Completed" | "Cancelled";
  companyId?: string | null;
  opportunityId?: string | null;
  applicationId?: string | null;
  interviewId?: string | null;
}) {
  const existing = await prisma.actionItem.findFirst({
    where: { userId: params.userId, title: params.title },
    select: { id: true },
  });

  const data = {
    title: params.title,
    description: params.description ?? null,
    dueAt: params.dueAt ?? null,
    priority: params.priority,
    status: params.status,
    companyId: params.companyId ?? null,
    opportunityId: params.opportunityId ?? null,
    applicationId: params.applicationId ?? null,
    interviewId: params.interviewId ?? null,
    suggestedBySystem: false,
  } as const;

  if (existing) {
    return prisma.actionItem.update({
      where: { id: existing.id },
      data,
      select: { id: true },
    });
  }

  return prisma.actionItem.create({
    data: {
      userId: params.userId,
      ...data,
    },
    select: { id: true },
  });
}

async function main() {
  console.log("Seeding CareerDeck demo dataset (idempotent).");
  console.log("Safety: do not reseed production on every deploy; run only for initial population or controlled refresh.");

  // Keep accounts separated:
  // - demo@... holds the canonical dataset for screenshots and manual review
  // - blank@... stays empty for uncluttered manual testing
  // - e2e@... is used by Playwright so the demo account is not polluted by E2E-created records
  await upsertBlankUser();
  await upsertE2EUser();
  const demoUser = await upsertDemoUser();
  const userId = demoUser.id;

  const companies = await Promise.all([
    upsertCompany({
      userId,
      name: "Intel Malaysia",
      website: "https://www.intel.com",
      location: "Penang, Malaysia",
      industry: "Semiconductors",
      techStackNotes: "C/C++, Python, firmware, validation, tooling.",
      applicationProcessNotes: "Campus pipeline; recruiter screen; technical interview.",
      interviewNotes: "Emphasis on fundamentals, debugging, and communication.",
      compensationNotes: "Internship compensation varies by intake and team.",
      generalNotes: "Strong validation culture; hardware + software collaboration.",
    }),
    upsertCompany({
      userId,
      name: "SanDisk",
      website: "https://www.sandisk.com",
      location: "Penang, Malaysia",
      industry: "Storage",
    }),
    upsertCompany({
      userId,
      name: "PETRONAS Digital",
      website: "https://www.petronas.com",
      location: "Kuala Lumpur, Malaysia",
      industry: "Energy / Digital",
      techStackNotes: "Data platforms, cloud services, internal products.",
      applicationProcessNotes: "Graduate intake; assessments; interviews.",
      interviewNotes: "Case-style questions + values alignment.",
      compensationNotes: "Graduate program compensation varies by track.",
      generalNotes: "Enterprise environment; stakeholder-heavy projects.",
    }),
    upsertCompany({
      userId,
      name: "Atlassian",
      website: "https://www.atlassian.com",
      location: "Remote (APAC)",
      industry: "SaaS",
    }),
    upsertCompany({
      userId,
      name: "AMD",
      website: "https://www.amd.com",
      location: "Penang, Malaysia",
      industry: "Semiconductors",
      techStackNotes: "Validation, scripting, tooling, CI.",
      applicationProcessNotes: "Recruiter screen; technical rounds; team match.",
      interviewNotes: "Signals: test strategy, problem decomposition, ownership.",
      compensationNotes: "Graduate compensation varies by role and level.",
      generalNotes: "High bar on quality and collaboration across teams.",
    }),
    upsertCompany({
      userId,
      name: "Shell",
      website: "https://www.shell.com",
      location: "Kuala Lumpur, Malaysia",
      industry: "Energy",
      techStackNotes: "Data & analytics, cloud tooling, internal platforms.",
      applicationProcessNotes: "Online assessment; structured interviews.",
      interviewNotes: "Structured behavioral + technical scenario questions.",
      compensationNotes: "Graduate program varies by track.",
      generalNotes: "Process-driven; strong emphasis on communication.",
    }),
    upsertCompany({
      userId,
      name: "Keysight",
      website: "https://www.keysight.com",
      location: "Penang, Malaysia",
      industry: "Test & measurement",
      techStackNotes: "Software engineering; systems; test automation.",
      applicationProcessNotes: "Recruiter screen then technical interview.",
      interviewNotes: "Fundamentals + practical debugging signals.",
      compensationNotes: "Graduate compensation varies by role and level.",
      generalNotes: "Good engineering culture; operational clarity matters.",
    }),
    upsertCompany({
      userId,
      name: "Motorola Solutions",
      website: "https://www.motorolasolutions.com",
      location: "Penang, Malaysia",
      industry: "Communications",
    }),
    upsertCompany({
      userId,
      name: "AirAsia MOVE",
      website: "https://www.airasia.com",
      location: "Kuala Lumpur, Malaysia",
      industry: "Travel / Apps",
    }),
    upsertCompany({
      userId,
      name: "Dell Technologies",
      website: "https://www.dell.com",
      location: "Cyberjaya, Malaysia",
      industry: "Hardware / Enterprise",
    }),
    upsertCompany({
      userId,
      name: "Huawei",
      website: "https://www.huawei.com",
      location: "Kuala Lumpur, Malaysia",
      industry: "Cloud / Telecom",
    }),
  ]);

  const companyByName = new Map(companies.map((c) => [c.name, c]));

  const seedArchiveAt = kualaLumpurTime("2026-04-02T12:00:00+08:00");

  const oppIntel = await upsertOpportunity({
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

  await upsertOpportunity({
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

  await upsertOpportunity({
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

  await upsertOpportunity({
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
  const oppAmd = await upsertOpportunity({
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

  const oppShell = await upsertOpportunity({
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

  const oppKeysight = await upsertOpportunity({
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

  const oppMotorola = await upsertOpportunity({
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

  const oppAirAsia = await upsertOpportunity({
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
  const oppDell = await upsertOpportunity({
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

  const oppHuawei = await upsertOpportunity({
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

  // Applications (5 active + 2 closed outcomes)
  const appAmd = await upsertApplication({
    userId,
    opportunityId: oppAmd.id,
    companyId: companyByName.get("AMD")!.id,
    currentStage: "Applied",
    appliedDate: dateUtcNoon(2026, 3, 29),
    priority: "High",
    tags: ["validation"],
  });

  const appShell = await upsertApplication({
    userId,
    opportunityId: oppShell.id,
    companyId: companyByName.get("Shell")!.id,
    currentStage: "Assessment",
    appliedDate: dateUtcNoon(2026, 3, 30),
    priority: "High",
    tags: ["data"],
  });

  const appKeysight = await upsertApplication({
    userId,
    opportunityId: oppKeysight.id,
    companyId: companyByName.get("Keysight")!.id,
    currentStage: "Interview",
    appliedDate: dateUtcNoon(2026, 3, 26),
    priority: "High",
    tags: ["interview"],
  });

  const appMotorola = await upsertApplication({
    userId,
    opportunityId: oppMotorola.id,
    companyId: companyByName.get("Motorola Solutions")!.id,
    currentStage: "Interview",
    appliedDate: dateUtcNoon(2026, 3, 27),
    priority: "Medium",
    tags: ["interview"],
  });

  await upsertApplication({
    userId,
    opportunityId: oppAirAsia.id,
    companyId: companyByName.get("AirAsia MOVE")!.id,
    currentStage: "Applied",
    appliedDate: dateUtcNoon(2026, 3, 31),
    priority: "Medium",
    tags: ["backend"],
  });

  const appDell = await upsertApplication({
    userId,
    opportunityId: oppDell.id,
    companyId: companyByName.get("Dell Technologies")!.id,
    currentStage: "Offer",
    appliedDate: dateUtcNoon(2026, 3, 31),
    priority: "High",
    tags: ["offer"],
  });

  const appHuawei = await upsertApplication({
    userId,
    opportunityId: oppHuawei.id,
    companyId: companyByName.get("Huawei")!.id,
    currentStage: "Rejected",
    appliedDate: dateUtcNoon(2026, 4, 1),
    priority: "Medium",
    tags: ["rejected"],
  });

  // Contacts
  await upsertContact({
    companyId: companyByName.get("Intel Malaysia")!.id,
    name: "Sarah Lim",
    title: "University Relations Recruiter",
    email: "sarah.lim@intel.example",
  });

  const contactAmd = await upsertContact({
    companyId: companyByName.get("AMD")!.id,
    name: "Daniel Wong",
    title: "Talent Acquisition Specialist",
    email: "daniel.wong@amd.example",
  });

  await upsertContact({
    companyId: companyByName.get("PETRONAS Digital")!.id,
    name: "Nur Aisyah Rahman",
    title: "Graduate Hiring Coordinator",
    email: "nur.aisyah@petronas.example",
  });

  const contactShell = await upsertContact({
    companyId: companyByName.get("Shell")!.id,
    name: "Priya Nair",
    title: "Campus and Graduate Recruiter",
    email: "priya.nair@shell.example",
  });

  // Link contacts to applications (canonical seed relationships)
  await prisma.application.update({
    where: { id: appAmd.id },
    data: {
      contacts: {
        set: [{ id: contactAmd.id }],
      },
    },
  });

  await prisma.application.update({
    where: { id: appShell.id },
    data: {
      contacts: {
        set: [{ id: contactShell.id }],
      },
    },
  });

  // Interviews (4)
  const interviewKeysightRecruiter = await upsertInterview({
    applicationId: appKeysight.id,
    interviewType: "RecruiterScreen",
    scheduledAt: kualaLumpurTime("2026-04-08T10:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Keysight (Recruiter call)",
  });

  await upsertInterview({
    applicationId: appKeysight.id,
    interviewType: "TechnicalInterview",
    scheduledAt: kualaLumpurTime("2026-04-11T14:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Keysight (Technical interview)",
  });

  await upsertInterview({
    applicationId: appMotorola.id,
    interviewType: "HRScreen",
    scheduledAt: kualaLumpurTime("2026-04-09T15:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Motorola (HR screen)",
  });

  await upsertInterview({
    applicationId: appMotorola.id,
    interviewType: "FinalInterview",
    scheduledAt: kualaLumpurTime("2026-04-15T11:00:00+08:00"),
    status: "Scheduled",
    locationOrLink: "Motorola (Final interview)",
  });

  // Action items (7) with 3 overdue open items (Follow-ups Due = 3)
  await upsertActionItem({
    userId,
    title: "Tailor resume for Intel internship",
    dueAt: kualaLumpurTime("2026-04-05T09:00:00+08:00"),
    priority: "High",
    status: "Open",
    companyId: companyByName.get("Intel Malaysia")!.id,
    opportunityId: oppIntel.id,
  });

  await upsertActionItem({
    userId,
    title: "Follow up AMD application",
    dueAt: kualaLumpurTime("2026-04-06T09:00:00+08:00"),
    priority: "High",
    status: "Open",
    companyId: companyByName.get("AMD")!.id,
    applicationId: appAmd.id,
  });

  await upsertActionItem({
    userId,
    title: "Complete Shell online assessment",
    dueAt: kualaLumpurTime("2026-04-07T09:00:00+08:00"),
    priority: "High",
    status: "InProgress",
    companyId: companyByName.get("Shell")!.id,
    applicationId: appShell.id,
  });

  await upsertActionItem({
    userId,
    title: "Prepare STAR examples for Keysight interview",
    dueAt: kualaLumpurTime("2026-04-08T09:00:00+08:00"),
    priority: "Medium",
    status: "Completed",
    companyId: companyByName.get("Keysight")!.id,
    applicationId: appKeysight.id,
    interviewId: interviewKeysightRecruiter.id,
  });

  await upsertActionItem({
    userId,
    title: "Research Motorola product lines",
    dueAt: kualaLumpurTime("2026-04-09T09:00:00+08:00"),
    priority: "Medium",
    status: "Completed",
    companyId: companyByName.get("Motorola Solutions")!.id,
    applicationId: appMotorola.id,
  });

  await upsertActionItem({
    userId,
    title: "Compare Dell offer package",
    dueAt: kualaLumpurTime("2026-04-10T09:00:00+08:00"),
    priority: "Medium",
    status: "Completed",
    companyId: companyByName.get("Dell Technologies")!.id,
    applicationId: appDell.id,
  });

  await upsertActionItem({
    userId,
    title: "Capture lessons learned from Huawei rejection",
    dueAt: kualaLumpurTime("2026-04-04T09:00:00+08:00"),
    priority: "Low",
    status: "Completed",
    companyId: companyByName.get("Huawei")!.id,
    applicationId: appHuawei.id,
  });

  // Offer + rejection details
  await prisma.offerDetail.upsert({
    where: { applicationId: appDell.id },
    update: {
      offeredDate: dateUtcNoon(2026, 3, 31),
      compensationNote: "RM 4,800 monthly",
      responseDeadline: dateUtcNoon(2026, 4, 12),
      decisionStatus: "Pending",
      notes: "Graduate entry role, hybrid, Cyberjaya",
    },
    create: {
      applicationId: appDell.id,
      offeredDate: dateUtcNoon(2026, 3, 31),
      compensationNote: "RM 4,800 monthly",
      responseDeadline: dateUtcNoon(2026, 4, 12),
      decisionStatus: "Pending",
      notes: "Graduate entry role, hybrid, Cyberjaya",
    },
  });

  await prisma.rejectionDetail.upsert({
    where: { applicationId: appHuawei.id },
    update: {
      rejectionDate: dateUtcNoon(2026, 4, 1),
      rejectedAtStage: "Assessment",
      notes: "Stronger cloud certification background was likely expected",
    },
    create: {
      applicationId: appHuawei.id,
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

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
