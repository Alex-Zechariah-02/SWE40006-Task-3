import "server-only";

import type { ActionItemStatus, ActionItemPriority } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface ActionItemFilters {
  status?: ActionItemStatus;
  priority?: ActionItemPriority;
  companyId?: string;
  opportunityId?: string;
  applicationId?: string;
  interviewId?: string;
  sort?: "newest" | "dueDate" | "priority";
}

export async function listActionItems(
  userId: string,
  filters: ActionItemFilters = {}
) {
  const where: Record<string, unknown> = { userId };

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.priority) {
    where.priority = filters.priority;
  }
  if (filters.companyId) {
    where.companyId = filters.companyId;
  }
  if (filters.opportunityId) {
    where.opportunityId = filters.opportunityId;
  }
  if (filters.applicationId) {
    where.applicationId = filters.applicationId;
  }
  if (filters.interviewId) {
    where.interviewId = filters.interviewId;
  }

  let orderBy: Record<string, string>;
  switch (filters.sort) {
    case "dueDate":
      orderBy = { dueAt: "asc" };
      break;
    case "priority":
      orderBy = { priority: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  return prisma.actionItem.findMany({
    where,
    include: {
      company: { select: { id: true, name: true } },
      opportunity: { select: { id: true, title: true } },
      application: { select: { id: true } },
      interview: { select: { id: true, interviewType: true } },
    },
    orderBy,
  });
}

export async function getActionItem(id: string, userId: string) {
  return prisma.actionItem.findFirst({
    where: { id, userId },
    include: {
      company: { select: { id: true, name: true } },
      opportunity: { select: { id: true, title: true } },
      application: { select: { id: true } },
      interview: { select: { id: true, interviewType: true, scheduledAt: true } },
    },
  });
}

export async function createActionItem(
  userId: string,
  data: {
    title: string;
    description?: string;
    dueAt?: string;
    priority: ActionItemPriority;
    status: ActionItemStatus;
    companyId?: string;
    opportunityId?: string;
    applicationId?: string;
    interviewId?: string;
  }
) {
  // Verify linked entities belong to user if provided
  if (data.companyId) {
    const company = await prisma.company.findFirst({
      where: { id: data.companyId, userId },
      select: { id: true },
    });
    if (!company) {
      throw new Error("Company not found or not owned by user.");
    }
  }

  if (data.opportunityId) {
    const opportunity = await prisma.opportunity.findFirst({
      where: { id: data.opportunityId, userId },
      select: { id: true },
    });
    if (!opportunity) {
      throw new Error("Opportunity not found or not owned by user.");
    }
  }

  if (data.applicationId) {
    const application = await prisma.application.findFirst({
      where: { id: data.applicationId, userId },
      select: { id: true },
    });
    if (!application) {
      throw new Error("Application not found or not owned by user.");
    }
  }

  if (data.interviewId) {
    const interview = await prisma.interview.findFirst({
      where: { id: data.interviewId, application: { userId } },
      select: { id: true },
    });
    if (!interview) {
      throw new Error("Interview not found or not owned by user.");
    }
  }

  return prisma.actionItem.create({
    data: {
      userId,
      title: data.title,
      description: data.description || null,
      dueAt: data.dueAt ? new Date(data.dueAt) : null,
      priority: data.priority,
      status: data.status,
      companyId: data.companyId || null,
      opportunityId: data.opportunityId || null,
      applicationId: data.applicationId || null,
      interviewId: data.interviewId || null,
      suggestedBySystem: false,
    },
  });
}

export async function updateActionItem(
  id: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    dueAt?: string | null;
    priority?: ActionItemPriority;
    status?: ActionItemStatus;
  }
) {
  const update: Record<string, unknown> = {};

  if (data.title !== undefined) update.title = data.title;
  if (data.description !== undefined) update.description = data.description || null;
  if (data.dueAt !== undefined) {
    update.dueAt = data.dueAt ? new Date(data.dueAt) : null;
  }
  if (data.priority !== undefined) update.priority = data.priority;
  if (data.status !== undefined) update.status = data.status;

  return prisma.actionItem.update({
    where: { id, userId },
    data: update,
  });
}

export async function deleteActionItem(id: string, userId: string) {
  return prisma.actionItem.delete({
    where: { id, userId },
  });
}
