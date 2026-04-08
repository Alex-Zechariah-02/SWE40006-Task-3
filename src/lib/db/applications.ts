import "server-only";

import type { ApplicationStage, ActionItemPriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export class ApplicationAlreadyExistsError extends Error {
  existingApplicationId: string;

  constructor(existingApplicationId: string) {
    super("Application already exists for this opportunity.");
    this.name = "ApplicationAlreadyExistsError";
    this.existingApplicationId = existingApplicationId;
  }
}

export interface ApplicationFilters {
  currentStage?: ApplicationStage;
  companyId?: string;
  priority?: ActionItemPriority;
  tag?: string;
  includeArchived?: boolean;
  activeOnly?: boolean;
  sort?: "newest" | "priority" | "company";
}

export async function listApplications(
  userId: string,
  filters: ApplicationFilters = {}
) {
  const where: Record<string, unknown> = { userId };

  if (!filters.includeArchived) {
    where.archivedAt = null;
  }

  if (filters.activeOnly) {
    where.currentStage = {
      notIn: ["Offer", "Rejected", "Withdrawn"],
    };
  }

  if (filters.currentStage) {
    where.currentStage = filters.currentStage;
  }
  if (filters.companyId) {
    where.companyId = filters.companyId;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }
  if (filters.tag) {
    where.tags = { has: filters.tag };
  }

  let orderBy: Record<string, string>;
  switch (filters.sort) {
    case "priority":
      orderBy = { priority: "desc" };
      break;
    case "company":
      orderBy = { company: "asc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  return prisma.application.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      opportunity: {
        select: { id: true, title: true, opportunityType: true, deadline: true },
      },
    },
    orderBy: filters.sort === "company"
      ? { company: { name: "asc" } }
      : orderBy,
  });
}

export async function getApplication(id: string, userId: string) {
  return prisma.application.findFirst({
    where: { id, userId },
    include: {
      company: { select: { id: true, name: true } },
      opportunity: {
        select: {
          id: true,
          title: true,
          opportunityType: true,
          location: true,
          remoteMode: true,
        },
      },
      interviews: {
        select: {
          id: true,
          interviewType: true,
          scheduledAt: true,
          locationOrLink: true,
          status: true,
          notes: true,
        },
        orderBy: { scheduledAt: "asc" },
      },
      contacts: {
        select: {
          id: true,
          name: true,
          title: true,
          email: true,
          phone: true,
        },
        orderBy: { name: "asc" },
      },
      actionItems: {
        select: {
          id: true,
          title: true,
          description: true,
          dueAt: true,
          priority: true,
          status: true,
        },
        orderBy: [{ status: "asc" }, { priority: "desc" }],
      },
      offerDetail: {
        select: {
          id: true,
          offeredDate: true,
          compensationNote: true,
          responseDeadline: true,
          decisionStatus: true,
          notes: true,
        },
      },
      rejectionDetail: {
        select: {
          id: true,
          rejectionDate: true,
          rejectedAtStage: true,
          notes: true,
        },
      },
    },
  });
}

export async function convertOpportunityToApplication(
  userId: string,
  data: {
    opportunityId: string;
    priority: ActionItemPriority;
    appliedDate?: string;
    statusNotes?: string;
    tags?: string[];
  }
) {
  // Verify opportunity exists and belongs to user
  const opportunity = await prisma.opportunity.findFirst({
    where: { id: data.opportunityId, userId },
    select: { id: true, companyId: true },
  });

  if (!opportunity) {
    throw new Error("Opportunity not found or not owned by user.");
  }

  // Verify company exists (should always be true if opportunity exists)
  const company = await prisma.company.findFirst({
    where: { id: opportunity.companyId, userId },
    select: { id: true },
  });

  if (!company) {
    throw new Error("Company not found.");
  }

  // Check if application already exists (unique constraint on opportunityId)
  const existing = await prisma.application.findUnique({
    where: { opportunityId: data.opportunityId },
    select: { id: true },
  });

  if (existing) {
    throw new ApplicationAlreadyExistsError(existing.id);
  }

  const application = await prisma.application.create({
    data: {
      userId,
      opportunityId: data.opportunityId,
      companyId: opportunity.companyId,
      currentStage: "Applied",
      priority: data.priority,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : null,
      statusNotes: data.statusNotes || null,
      tags: data.tags ?? [],
      archivedAt: null,
    },
    select: { id: true },
  });

  return { id: application.id, created: true };
}

export async function updateApplication(
  id: string,
  userId: string,
  data: {
    currentStage?: ApplicationStage;
    priority?: ActionItemPriority;
    appliedDate?: string | null;
    statusNotes?: string | null;
    tags?: string[];
  }
) {
  const update: Record<string, unknown> = {};

  if (data.currentStage !== undefined) update.currentStage = data.currentStage;
  if (data.priority !== undefined) update.priority = data.priority;
  if (data.appliedDate !== undefined) {
    update.appliedDate = data.appliedDate ? new Date(data.appliedDate) : null;
  }
  if (data.statusNotes !== undefined) update.statusNotes = data.statusNotes || null;
  if (data.tags !== undefined) update.tags = data.tags;

  return prisma.application.update({
    where: { id, userId },
    data: update,
  });
}

export async function archiveApplication(id: string, userId: string) {
  return prisma.application.update({
    where: { id, userId },
    data: { archivedAt: new Date() },
  });
}

export async function unarchiveApplication(id: string, userId: string) {
  return prisma.application.update({
    where: { id, userId },
    data: { archivedAt: null },
  });
}

export async function linkContactToApplication(
  applicationId: string,
  contactId: string,
  userId: string
) {
  // Verify application belongs to user
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: { id: true, companyId: true },
  });

  if (!application) {
    throw new Error("Application not found or not owned by user.");
  }

  // Verify contact belongs to user (through company)
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, company: { userId } },
    select: { id: true, companyId: true },
  });

  if (!contact) {
    throw new Error("Contact not found or not owned by user.");
  }

  if (contact.companyId !== application.companyId) {
    throw new Error("Contact does not belong to the same company as this application.");
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      contacts: {
        connect: { id: contactId },
      },
    },
  });
}

export async function unlinkContactFromApplication(
  applicationId: string,
  contactId: string,
  userId: string
) {
  // Verify application belongs to user
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found or not owned by user.");
  }

  return prisma.application.update({
    where: { id: applicationId },
    data: {
      contacts: {
        disconnect: { id: contactId },
      },
    },
  });
}

export async function createOfferDetail(
  applicationId: string,
  userId: string,
  data: {
    offeredDate?: string;
    compensationNote?: string;
    responseDeadline?: string;
    decisionStatus: string;
    notes?: string;
  }
) {
  // Verify application belongs to user and is in Offer stage
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId, currentStage: "Offer" },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found, not owned by user, or not in Offer stage.");
  }

  return prisma.offerDetail.create({
    data: {
      applicationId,
      offeredDate: data.offeredDate ? new Date(data.offeredDate) : null,
      compensationNote: data.compensationNote || null,
      responseDeadline: data.responseDeadline ? new Date(data.responseDeadline) : null,
      decisionStatus: data.decisionStatus,
      notes: data.notes || null,
    },
  });
}

export async function updateOfferDetail(
  applicationId: string,
  userId: string,
  data: {
    offeredDate?: string | null;
    compensationNote?: string | null;
    responseDeadline?: string | null;
    decisionStatus?: string;
    notes?: string | null;
  }
) {
  // Verify offer detail belongs to user
  const offerDetail = await prisma.offerDetail.findFirst({
    where: { applicationId, application: { userId } },
    select: { applicationId: true },
  });

  if (!offerDetail) {
    throw new Error("Offer detail not found.");
  }

  const update: Record<string, unknown> = {};

  if (data.offeredDate !== undefined) {
    update.offeredDate = data.offeredDate ? new Date(data.offeredDate) : null;
  }
  if (data.compensationNote !== undefined) update.compensationNote = data.compensationNote || null;
  if (data.responseDeadline !== undefined) {
    update.responseDeadline = data.responseDeadline ? new Date(data.responseDeadline) : null;
  }
  if (data.decisionStatus !== undefined) update.decisionStatus = data.decisionStatus;
  if (data.notes !== undefined) update.notes = data.notes || null;

  return prisma.offerDetail.update({
    where: { applicationId },
    data: update,
  });
}

export async function createRejectionDetail(
  applicationId: string,
  userId: string,
  data: {
    rejectionDate?: string;
    rejectedAtStage: string;
    notes?: string;
  }
) {
  // Verify application belongs to user and is in Rejected stage
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId, currentStage: "Rejected" },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found, not owned by user, or not in Rejected stage.");
  }

  return prisma.rejectionDetail.create({
    data: {
      applicationId,
      rejectionDate: data.rejectionDate ? new Date(data.rejectionDate) : null,
      rejectedAtStage: data.rejectedAtStage,
      notes: data.notes || null,
    },
  });
}

export async function updateRejectionDetail(
  applicationId: string,
  userId: string,
  data: {
    rejectionDate?: string | null;
    rejectedAtStage?: string;
    notes?: string | null;
  }
) {
  // Verify rejection detail belongs to user
  const rejectionDetail = await prisma.rejectionDetail.findFirst({
    where: { applicationId, application: { userId } },
    select: { applicationId: true },
  });

  if (!rejectionDetail) {
    throw new Error("Rejection detail not found.");
  }

  const update: Record<string, unknown> = {};

  if (data.rejectionDate !== undefined) {
    update.rejectionDate = data.rejectionDate ? new Date(data.rejectionDate) : null;
  }
  if (data.rejectedAtStage !== undefined) update.rejectedAtStage = data.rejectedAtStage;
  if (data.notes !== undefined) update.notes = data.notes || null;

  return prisma.rejectionDetail.update({
    where: { applicationId },
    data: update,
  });
}

export async function deleteOfferDetail(applicationId: string, userId: string) {
  const offerDetail = await prisma.offerDetail.findFirst({
    where: { applicationId, application: { userId } },
    select: { applicationId: true },
  });

  if (!offerDetail) {
    throw new Error("Offer detail not found.");
  }

  return prisma.offerDetail.delete({ where: { applicationId } });
}

export async function deleteRejectionDetail(applicationId: string, userId: string) {
  const rejectionDetail = await prisma.rejectionDetail.findFirst({
    where: { applicationId, application: { userId } },
    select: { applicationId: true },
  });

  if (!rejectionDetail) {
    throw new Error("Rejection detail not found.");
  }

  return prisma.rejectionDetail.delete({ where: { applicationId } });
}
