import "server-only";

import type { ApplicationStage, ActionItemPriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ApplicationFilters } from "./applications.types";
import { APPLICATION_DETAIL_INCLUDE, APPLICATION_LIST_INCLUDE } from "./applications.selects";
import {
  buildApplicationUpdateData,
  buildListApplicationsOrderBy,
  buildListApplicationsWhere,
  buildOfferDetailUpdateData,
  buildRejectionDetailUpdateData,
  parseDateOrNull,
} from "./applications.logic";
import {
  assertApplicationInStageOrThrow,
  assertApplicationOwnedOrThrow,
  assertOfferDetailExistsOrThrow,
  assertRejectionDetailExistsOrThrow,
  getApplicationCompanyIdOrThrow,
  getContactCompanyIdOrThrow,
} from "./applications.assert";

export type { ApplicationFilters } from "./applications.types";

export class ApplicationAlreadyExistsError extends Error {
  existingApplicationId: string;

  constructor(existingApplicationId: string) {
    super("Application already exists for this opportunity.");
    this.name = "ApplicationAlreadyExistsError";
    this.existingApplicationId = existingApplicationId;
  }
}

export async function listApplications(
  userId: string,
  filters: ApplicationFilters = {}
) {
  const where = buildListApplicationsWhere({ userId, filters });
  const orderBy = buildListApplicationsOrderBy(filters.sort);

  return prisma.application.findMany({
    where,
    include: APPLICATION_LIST_INCLUDE,
    orderBy,
  });
}

export async function getApplication(id: string, userId: string) {
  return prisma.application.findFirst({
    where: { id, userId },
    include: APPLICATION_DETAIL_INCLUDE,
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
      appliedDate: parseDateOrNull(data.appliedDate),
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
  const update = buildApplicationUpdateData(data);

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
  const application = await getApplicationCompanyIdOrThrow({ applicationId, userId });
  const contact = await getContactCompanyIdOrThrow({ contactId, userId });

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
  await assertApplicationOwnedOrThrow({ applicationId, userId });

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
  await assertApplicationInStageOrThrow({
    applicationId,
    userId,
    stage: "Offer",
    message: "Application not found, not owned by user, or not in Offer stage.",
  });

  return prisma.offerDetail.create({
    data: {
      applicationId,
      offeredDate: parseDateOrNull(data.offeredDate),
      compensationNote: data.compensationNote || null,
      responseDeadline: parseDateOrNull(data.responseDeadline),
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
  await assertOfferDetailExistsOrThrow({ applicationId, userId });

  const update = buildOfferDetailUpdateData(data);

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
  await assertApplicationInStageOrThrow({
    applicationId,
    userId,
    stage: "Rejected",
    message: "Application not found, not owned by user, or not in Rejected stage.",
  });

  return prisma.rejectionDetail.create({
    data: {
      applicationId,
      rejectionDate: parseDateOrNull(data.rejectionDate),
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
  await assertRejectionDetailExistsOrThrow({ applicationId, userId });

  const update = buildRejectionDetailUpdateData(data);

  return prisma.rejectionDetail.update({
    where: { applicationId },
    data: update,
  });
}

export async function deleteOfferDetail(applicationId: string, userId: string) {
  await assertOfferDetailExistsOrThrow({ applicationId, userId });

  return prisma.offerDetail.delete({ where: { applicationId } });
}

export async function deleteRejectionDetail(applicationId: string, userId: string) {
  await assertRejectionDetailExistsOrThrow({ applicationId, userId });

  return prisma.rejectionDetail.delete({ where: { applicationId } });
}

export async function deleteApplication(id: string, userId: string) {
  const application = await prisma.application.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  // Interview, OfferDetail, RejectionDetail cascade on delete.
  // ActionItems are SetNull'd automatically.
  // Contact many-to-many links are disconnected by Prisma.
  return prisma.application.delete({ where: { id } });
}
