import type { PrismaClient } from "@prisma/client";

import { normalizeCompanyName } from "../../src/lib/db/normalize";

import {
  canonicalizeUrl,
  computeDedupeKey,
  computeManualDedupeKey,
} from "./utils";

export async function upsertCompany(
  prisma: PrismaClient,
  params: {
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
  }
) {
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

export async function upsertOpportunity(
  prisma: PrismaClient,
  params: {
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
  }
) {
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

