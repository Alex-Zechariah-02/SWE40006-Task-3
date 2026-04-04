import "server-only";

import type { OpportunityType, RemoteMode, OpportunityStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeCompanyName } from "@/lib/db/normalize";
import { computeManualDedupeKey } from "@/lib/search/dedupe";

export interface OpportunityFilters {
  stage?: OpportunityStage;
  sourceType?: string;
  opportunityType?: OpportunityType;
  companyId?: string;
  tag?: string;
  includeArchived?: boolean;
  sort?: "newest" | "deadline" | "company";
}

export async function listOpportunities(
  userId: string,
  filters: OpportunityFilters = {}
) {
  const where: Record<string, unknown> = { userId };

  if (!filters.includeArchived) {
    where.archivedAt = null;
  }
  if (filters.stage) {
    where.stage = filters.stage;
  }
  if (filters.sourceType) {
    where.sourceType = filters.sourceType;
  }
  if (filters.opportunityType) {
    where.opportunityType = filters.opportunityType;
  }
  if (filters.companyId) {
    where.companyId = filters.companyId;
  }
  if (filters.tag) {
    where.tags = { has: filters.tag };
  }

  let orderBy: Record<string, string>;
  switch (filters.sort) {
    case "deadline":
      orderBy = { deadline: "asc" };
      break;
    case "company":
      orderBy = { company: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  return prisma.opportunity.findMany({
    where,
    include: { company: { select: { id: true, name: true } } },
    orderBy: filters.sort === "company"
      ? { company: { name: "asc" } }
      : orderBy,
  });
}

export async function getOpportunity(id: string, userId: string) {
  return prisma.opportunity.findFirst({
    where: { id, userId },
    include: {
      company: { select: { id: true, name: true } },
      application: { select: { id: true, currentStage: true } },
    },
  });
}

export async function createManualOpportunity(
  userId: string,
  data: {
    title: string;
    companyName: string;
    opportunityType: OpportunityType;
    remoteMode: RemoteMode;
    location?: string;
    sourceUrl?: string;
    deadline?: string;
    snippet?: string;
    description?: string;
    notes?: string;
    tags?: string[];
  }
) {
  const companyParts = normalizeCompanyName(data.companyName);

  const company = await prisma.company.upsert({
    where: {
      userId_normalizedName: {
        userId,
        normalizedName: companyParts.normalizedName,
      },
    },
    update: { name: companyParts.name },
    create: {
      userId,
      name: companyParts.name,
      normalizedName: companyParts.normalizedName,
    },
    select: { id: true },
  });

  const dedupeKey = computeManualDedupeKey({
    title: data.title,
    companyName: companyParts.normalizedName,
    location: data.location || "",
    opportunityType: data.opportunityType,
  });

  const existing = await prisma.opportunity.findUnique({
    where: { userId_dedupeKey: { userId, dedupeKey } },
    select: { id: true },
  });

  if (existing) {
    return { id: existing.id, created: false };
  }

  const opportunity = await prisma.opportunity.create({
    data: {
      userId,
      companyId: company.id,
      title: data.title,
      opportunityType: data.opportunityType,
      location: data.location || null,
      remoteMode: data.remoteMode,
      sourceType: "Manual",
      sourceUrl: data.sourceUrl || null,
      sourceProvider: "manual",
      externalSourceId: null,
      snippet: data.snippet || null,
      description: data.description || null,
      stage: "Saved",
      deadline: data.deadline ? new Date(data.deadline) : null,
      tags: data.tags ?? [],
      notes: data.notes || null,
      dedupeKey,
      rawProviderPayload: undefined,
      importedAt: null,
      archivedAt: null,
    },
    select: { id: true },
  });

  return { id: opportunity.id, created: true };
}

export async function updateOpportunity(
  id: string,
  userId: string,
  data: {
    title?: string;
    opportunityType?: OpportunityType;
    remoteMode?: RemoteMode;
    stage?: OpportunityStage;
    location?: string | null;
    sourceUrl?: string | null;
    deadline?: string | null;
    snippet?: string | null;
    description?: string | null;
    notes?: string | null;
    tags?: string[];
  }
) {
  const update: Record<string, unknown> = {};

  if (data.title !== undefined) update.title = data.title;
  if (data.opportunityType !== undefined) update.opportunityType = data.opportunityType;
  if (data.remoteMode !== undefined) update.remoteMode = data.remoteMode;
  if (data.stage !== undefined) update.stage = data.stage;
  if (data.location !== undefined) update.location = data.location || null;
  if (data.sourceUrl !== undefined) update.sourceUrl = data.sourceUrl || null;
  if (data.snippet !== undefined) update.snippet = data.snippet || null;
  if (data.description !== undefined) update.description = data.description || null;
  if (data.notes !== undefined) update.notes = data.notes || null;
  if (data.tags !== undefined) update.tags = data.tags;
  if (data.deadline !== undefined) {
    update.deadline = data.deadline ? new Date(data.deadline) : null;
  }

  return prisma.opportunity.update({
    where: { id, userId },
    data: update,
  });
}

export async function archiveOpportunity(id: string, userId: string) {
  return prisma.opportunity.update({
    where: { id, userId },
    data: { archivedAt: new Date() },
  });
}

export async function unarchiveOpportunity(id: string, userId: string) {
  return prisma.opportunity.update({
    where: { id, userId },
    data: { archivedAt: null },
  });
}
