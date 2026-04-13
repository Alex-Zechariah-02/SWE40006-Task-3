import "server-only";

import { prisma } from "@/lib/prisma";
import { normalizeCompanyName } from "@/lib/db/normalize";

export interface CompanyFilters {
  includeArchived?: boolean;
  sort?: "newest" | "name";
}

export async function listCompanies(
  userId: string,
  filters: CompanyFilters = {}
) {
  const where: Record<string, unknown> = { userId };

  if (!filters.includeArchived) {
    where.archivedAt = null;
  }

  return prisma.company.findMany({
    where,
    include: {
      _count: { select: { opportunities: true, contacts: true, applications: true } },
    },
    orderBy: filters.sort === "name" ? { name: "asc" } : { createdAt: "desc" },
  });
}

export async function getCompany(id: string, userId: string) {
  return prisma.company.findFirst({
    where: { id, userId },
    include: {
      contacts: { orderBy: { createdAt: "desc" } },
      applications: {
        select: {
          id: true,
          currentStage: true,
          priority: true,
          appliedDate: true,
          opportunity: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      opportunities: {
        where: { archivedAt: null },
        select: { id: true, title: true, stage: true, opportunityType: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { applications: true } },
    },
  });
}

export async function createCompany(
  userId: string,
  data: {
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
  const companyParts = normalizeCompanyName(data.name);

  const existing = await prisma.company.findUnique({
    where: {
      userId_normalizedName: {
        userId,
        normalizedName: companyParts.normalizedName,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return { id: existing.id, created: false };
  }

  const company = await prisma.company.create({
    data: {
      userId,
      name: companyParts.name,
      normalizedName: companyParts.normalizedName,
      website: data.website || null,
      location: data.location || null,
      industry: data.industry || null,
      techStackNotes: data.techStackNotes || null,
      applicationProcessNotes: data.applicationProcessNotes || null,
      interviewNotes: data.interviewNotes || null,
      compensationNotes: data.compensationNotes || null,
      generalNotes: data.generalNotes || null,
    },
    select: { id: true },
  });

  return { id: company.id, created: true };
}

export async function updateCompany(
  id: string,
  userId: string,
  data: {
    name?: string;
    website?: string | null;
    location?: string | null;
    industry?: string | null;
    techStackNotes?: string | null;
    applicationProcessNotes?: string | null;
    interviewNotes?: string | null;
    compensationNotes?: string | null;
    generalNotes?: string | null;
  }
) {
  const update: Record<string, unknown> = {};

  if (data.name !== undefined) {
    const parts = normalizeCompanyName(data.name);
    update.name = parts.name;
    update.normalizedName = parts.normalizedName;
  }
  if (data.website !== undefined) update.website = data.website || null;
  if (data.location !== undefined) update.location = data.location || null;
  if (data.industry !== undefined) update.industry = data.industry || null;
  if (data.techStackNotes !== undefined)
    update.techStackNotes = data.techStackNotes || null;
  if (data.applicationProcessNotes !== undefined)
    update.applicationProcessNotes = data.applicationProcessNotes || null;
  if (data.interviewNotes !== undefined)
    update.interviewNotes = data.interviewNotes || null;
  if (data.compensationNotes !== undefined)
    update.compensationNotes = data.compensationNotes || null;
  if (data.generalNotes !== undefined)
    update.generalNotes = data.generalNotes || null;

  return prisma.company.update({
    where: { id, userId },
    data: update,
  });
}

export async function archiveCompany(id: string, userId: string) {
  return prisma.company.update({
    where: { id, userId },
    data: { archivedAt: new Date() },
  });
}

export async function unarchiveCompany(id: string, userId: string) {
  return prisma.company.update({
    where: { id, userId },
    data: { archivedAt: null },
  });
}

export class CompanyHasLinkedRecordsError extends Error {
  opportunities: number;
  applications: number;
  contacts: number;

  constructor(opportunities: number, applications: number, contacts: number) {
    super(
      `Cannot delete: ${opportunities} opportunities, ${applications} applications, and ${contacts} contacts linked to this company.`
    );
    this.name = "CompanyHasLinkedRecordsError";
    this.opportunities = opportunities;
    this.applications = applications;
    this.contacts = contacts;
  }
}

export async function deleteCompany(id: string, userId: string) {
  const company = await prisma.company.findFirst({
    where: { id, userId },
    select: {
      id: true,
      _count: { select: { opportunities: true, applications: true, contacts: true } },
    },
  });

  if (!company) {
    throw new Error("Company not found.");
  }

  const { opportunities, applications, contacts } = company._count;
  if (opportunities > 0 || applications > 0 || contacts > 0) {
    throw new CompanyHasLinkedRecordsError(opportunities, applications, contacts);
  }

  return prisma.company.delete({ where: { id } });
}
