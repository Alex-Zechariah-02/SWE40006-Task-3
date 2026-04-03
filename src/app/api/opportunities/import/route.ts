import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "../../../../../auth";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canonicalizeUrl, computeDedupeKey } from "@/lib/search/dedupe";

export const runtime = "nodejs";

const payloadSchema = z.object({
  title: z.string().trim().min(1).max(200),
  companyName: z.string().trim().min(1).max(200),
  location: z.string().trim().min(1).max(200),
  remoteMode: z.string().trim().optional(),
  opportunityType: z.string().trim().optional(),
  sourceUrl: z.string().trim().url(),
  sourceProvider: z.string().trim().min(1).max(40),
  snippet: z.string().trim().max(2000).optional(),
  postedDate: z.string().trim().max(40).optional(),
  confidence: z.number().optional(),
  rawProviderPayload: z.unknown().optional(),
});

function normalizeCompanyName(value: string): { name: string; normalizedName: string } {
  const name = value.trim();
  const normalizedName = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return { name, normalizedName };
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

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json(
      { error: { message: "You must be signed in to import an opportunity." } },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: { message: "Account not found." } },
      { status: 401 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "The saved opportunity is invalid. Try saving it again." } },
      { status: 400 }
    );
  }

  const canonicalUrl = canonicalizeUrl(parsed.data.sourceUrl);
  const dedupeKey = computeDedupeKey({
    provider: parsed.data.sourceProvider,
    canonicalUrl,
  });

  const existing = await prisma.opportunity.findUnique({
    where: { userId_dedupeKey: { userId: user.id, dedupeKey } },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ opportunityId: existing.id, created: false });
  }

  const companyParts = normalizeCompanyName(parsed.data.companyName);

  const company = await prisma.company.upsert({
    where: {
      userId_normalizedName: {
        userId: user.id,
        normalizedName: companyParts.normalizedName,
      },
    },
    update: {
      name: companyParts.name,
    },
    create: {
      userId: user.id,
      name: companyParts.name,
      normalizedName: companyParts.normalizedName,
    },
    select: { id: true },
  });

  const rawProviderPayload =
    parsed.data.rawProviderPayload === undefined
      ? undefined
      : parsed.data.rawProviderPayload === null
        ? Prisma.JsonNull
        : (parsed.data.rawProviderPayload as Prisma.InputJsonValue);

  try {
    const created = await prisma.opportunity.create({
      data: {
        userId: user.id,
        companyId: company.id,
        title: parsed.data.title,
        opportunityType: mapOpportunityType(parsed.data.opportunityType),
        location: parsed.data.location,
        remoteMode: mapRemoteMode(parsed.data.remoteMode),
        sourceType: "Imported",
        sourceUrl: canonicalUrl,
        sourceProvider: parsed.data.sourceProvider,
        externalSourceId: null,
        snippet: parsed.data.snippet ?? null,
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

    return NextResponse.json({ opportunityId: created.id, created: true });
  } catch {
    const fallback = await prisma.opportunity.findUnique({
      where: { userId_dedupeKey: { userId: user.id, dedupeKey } },
      select: { id: true },
    });

    if (fallback) {
      return NextResponse.json({ opportunityId: fallback.id, created: false });
    }

    return NextResponse.json(
      { error: { message: "Import failed. Please try again." } },
      { status: 500 }
    );
  }
}
