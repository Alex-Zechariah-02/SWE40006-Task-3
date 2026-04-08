import "server-only";

import type { InterviewType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listInterviews(userId: string) {
  return prisma.interview.findMany({
    where: { application: { userId } },
    select: {
      id: true,
      applicationId: true,
      interviewType: true,
      scheduledAt: true,
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createInterview(
  userId: string,
  data: {
    applicationId: string;
    interviewType: InterviewType;
    scheduledAt: string;
    locationOrLink?: string;
    status: string;
    notes?: string;
  }
) {
  // Verify application belongs to user
  const application = await prisma.application.findFirst({
    where: { id: data.applicationId, userId },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found or not owned by user.");
  }

  return prisma.interview.create({
    data: {
      applicationId: data.applicationId,
      interviewType: data.interviewType,
      scheduledAt: new Date(data.scheduledAt),
      locationOrLink: data.locationOrLink || null,
      status: data.status,
      notes: data.notes || null,
    },
  });
}

export async function updateInterview(
  id: string,
  userId: string,
  data: {
    interviewType?: InterviewType;
    scheduledAt?: string;
    locationOrLink?: string | null;
    status?: string;
    notes?: string | null;
  }
) {
  // Verify interview belongs to user (through application)
  const interview = await prisma.interview.findFirst({
    where: { id, application: { userId } },
    select: { id: true },
  });

  if (!interview) {
    throw new Error("Interview not found.");
  }

  const update: Record<string, unknown> = {};

  if (data.interviewType !== undefined) update.interviewType = data.interviewType;
  if (data.scheduledAt !== undefined) update.scheduledAt = new Date(data.scheduledAt);
  if (data.locationOrLink !== undefined) update.locationOrLink = data.locationOrLink || null;
  if (data.status !== undefined) update.status = data.status;
  if (data.notes !== undefined) update.notes = data.notes || null;

  return prisma.interview.update({
    where: { id },
    data: update,
  });
}

export async function deleteInterview(id: string, userId: string) {
  // Verify interview belongs to user (through application)
  const interview = await prisma.interview.findFirst({
    where: { id, application: { userId } },
    select: { id: true },
  });

  if (!interview) {
    throw new Error("Interview not found.");
  }

  return prisma.interview.delete({ where: { id } });
}
