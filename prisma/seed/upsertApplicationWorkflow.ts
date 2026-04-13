import type { PrismaClient } from "@prisma/client";

export async function upsertApplication(
  prisma: PrismaClient,
  params: {
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
  }
) {
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

export async function upsertInterview(
  prisma: PrismaClient,
  params: {
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
  }
) {
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

export async function upsertContact(
  prisma: PrismaClient,
  params: {
    companyId: string;
    name: string;
    title?: string;
    email: string;
    phone?: string;
    linkedinUrl?: string;
    notes?: string;
  }
) {
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

export async function upsertActionItem(
  prisma: PrismaClient,
  params: {
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
  }
) {
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

