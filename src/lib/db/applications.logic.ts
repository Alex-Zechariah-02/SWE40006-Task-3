import type { Prisma } from "@prisma/client";
import type { ApplicationFilters } from "./applications.types";

export function buildListApplicationsWhere(params: {
  userId: string;
  filters: ApplicationFilters;
}): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = { userId: params.userId };

  if (!params.filters.includeArchived) {
    where.archivedAt = null;
  }

  if (params.filters.activeOnly) {
    where.currentStage = {
      notIn: ["Offer", "Rejected", "Withdrawn"],
    };
  }

  if (params.filters.currentStage) {
    where.currentStage = params.filters.currentStage;
  }
  if (params.filters.companyId) {
    where.companyId = params.filters.companyId;
  }
  if (params.filters.priority) {
    where.priority = params.filters.priority;
  }
  if (params.filters.tag) {
    where.tags = { has: params.filters.tag };
  }

  return where;
}

export function buildListApplicationsOrderBy(
  sort: ApplicationFilters["sort"]
): Prisma.ApplicationOrderByWithRelationInput {
  switch (sort) {
    case "priority":
      return { priority: "desc" };
    case "company":
      return { company: { name: "asc" } };
    default:
      return { createdAt: "desc" };
  }
}

export function parseDateOrNull(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

export function buildApplicationUpdateData(data: {
  currentStage?: string;
  priority?: string;
  appliedDate?: string | null;
  statusNotes?: string | null;
  tags?: string[];
}): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (data.currentStage !== undefined) update.currentStage = data.currentStage;
  if (data.priority !== undefined) update.priority = data.priority;
  if (data.appliedDate !== undefined) {
    update.appliedDate = data.appliedDate ? new Date(data.appliedDate) : null;
  }
  if (data.statusNotes !== undefined) update.statusNotes = data.statusNotes || null;
  if (data.tags !== undefined) update.tags = data.tags;

  return update;
}

export function buildOfferDetailUpdateData(data: {
  offeredDate?: string | null;
  compensationNote?: string | null;
  responseDeadline?: string | null;
  decisionStatus?: string;
  notes?: string | null;
}): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (data.offeredDate !== undefined) {
    update.offeredDate = data.offeredDate ? new Date(data.offeredDate) : null;
  }
  if (data.compensationNote !== undefined) {
    update.compensationNote = data.compensationNote || null;
  }
  if (data.responseDeadline !== undefined) {
    update.responseDeadline = data.responseDeadline ? new Date(data.responseDeadline) : null;
  }
  if (data.decisionStatus !== undefined) update.decisionStatus = data.decisionStatus;
  if (data.notes !== undefined) update.notes = data.notes || null;

  return update;
}

export function buildRejectionDetailUpdateData(data: {
  rejectionDate?: string | null;
  rejectedAtStage?: string;
  notes?: string | null;
}): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (data.rejectionDate !== undefined) {
    update.rejectionDate = data.rejectionDate ? new Date(data.rejectionDate) : null;
  }
  if (data.rejectedAtStage !== undefined) update.rejectedAtStage = data.rejectedAtStage;
  if (data.notes !== undefined) update.notes = data.notes || null;

  return update;
}

