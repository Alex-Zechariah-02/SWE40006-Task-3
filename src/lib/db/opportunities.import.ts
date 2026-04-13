import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { canonicalizeUrl, computeDedupeKey } from "@/lib/search/dedupe";
import { normalizeCompanyName } from "@/lib/db/normalize";

export type ImportOpportunityPayload = {
  title: string;
  companyName: string;
  location: string;
  remoteMode?: string;
  opportunityType?: string;
  sourceUrl: string;
  sourceProvider: string;
  snippet?: string;
  postedDate?: string;
  confidence?: number;
  rawProviderPayload?: unknown;
};

export type ImportOpportunityResult = {
  opportunityId: string;
  created: boolean;
};

export class OpportunityImportFailedError extends Error {
  constructor() {
    super("Opportunity import failed.");
    this.name = "OpportunityImportFailedError";
  }
}

function mapRemoteMode(value: string | undefined) {
  const v = (value ?? "").trim().toLowerCase();
  if (v.includes("remote")) return "Remote" as const;
  if (v.includes("hybrid")) return "Hybrid" as const;
  if (v.includes("on-site") || v.includes("onsite") || v.includes("on site")) {
    return "OnSite" as const;
  }
  return "OnSite" as const;
}

function mapOpportunityType(value: string | undefined) {
  const v = (value ?? "").trim().toLowerCase();
  if (v.includes("intern")) return "Internship" as const;
  if (v.includes("graduate")) return "GraduateProgram" as const;
  if (v.includes("part")) return "PartTime" as const;
  if (v.includes("contract")) return "Contract" as const;
  return "FullTime" as const;
}

export async function importOpportunityFromProvider(
  userId: string,
  payload: ImportOpportunityPayload
): Promise<ImportOpportunityResult> {
  const canonicalUrl = canonicalizeUrl(payload.sourceUrl);
  const dedupeKey = computeDedupeKey({
    provider: payload.sourceProvider,
    canonicalUrl,
  });

  const existing = await prisma.opportunity.findUnique({
    where: { userId_dedupeKey: { userId, dedupeKey } },
    select: { id: true },
  });

  if (existing) {
    return { opportunityId: existing.id, created: false };
  }

  const companyParts = normalizeCompanyName(payload.companyName);

  const company = await prisma.company.upsert({
    where: {
      userId_normalizedName: {
        userId,
        normalizedName: companyParts.normalizedName,
      },
    },
    update: {
      name: companyParts.name,
    },
    create: {
      userId,
      name: companyParts.name,
      normalizedName: companyParts.normalizedName,
    },
    select: { id: true },
  });

  const rawProviderPayload =
    payload.rawProviderPayload === undefined
      ? undefined
      : payload.rawProviderPayload === null
        ? Prisma.JsonNull
        : (payload.rawProviderPayload as Prisma.InputJsonValue);

  try {
    const created = await prisma.opportunity.create({
      data: {
        userId,
        companyId: company.id,
        title: payload.title,
        opportunityType: mapOpportunityType(payload.opportunityType),
        location: payload.location,
        remoteMode: mapRemoteMode(payload.remoteMode),
        sourceType: "Imported",
        sourceUrl: canonicalUrl,
        sourceProvider: payload.sourceProvider,
        externalSourceId: null,
        snippet: payload.snippet ?? null,
        description: null,
        stage: "Saved",
        deadline: null,
        tags: [],
        notes: null,
        dedupeKey,
        rawProviderPayload,
        importedAt: new Date(),
        archivedAt: null,
      },
      select: { id: true },
    });

    return { opportunityId: created.id, created: true };
  } catch {
    // Keep behavior stable under concurrent import attempts.
    const fallback = await prisma.opportunity.findUnique({
      where: { userId_dedupeKey: { userId, dedupeKey } },
      select: { id: true },
    });

    if (fallback) {
      return { opportunityId: fallback.id, created: false };
    }

    throw new OpportunityImportFailedError();
  }
}

