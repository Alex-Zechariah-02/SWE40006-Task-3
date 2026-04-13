import "server-only";

import type { ApplicationStage } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getApplicationCompanyIdOrThrow(params: {
  applicationId: string;
  userId: string;
}): Promise<{ id: string; companyId: string }> {
  const application = await prisma.application.findFirst({
    where: { id: params.applicationId, userId: params.userId },
    select: { id: true, companyId: true },
  });

  if (!application) {
    throw new Error("Application not found or not owned by user.");
  }

  return application;
}

export async function assertApplicationOwnedOrThrow(params: {
  applicationId: string;
  userId: string;
}): Promise<void> {
  const application = await prisma.application.findFirst({
    where: { id: params.applicationId, userId: params.userId },
    select: { id: true },
  });

  if (!application) {
    throw new Error("Application not found or not owned by user.");
  }
}

export async function assertApplicationInStageOrThrow(params: {
  applicationId: string;
  userId: string;
  stage: ApplicationStage;
  message: string;
}): Promise<void> {
  const application = await prisma.application.findFirst({
    where: { id: params.applicationId, userId: params.userId, currentStage: params.stage },
    select: { id: true },
  });

  if (!application) {
    throw new Error(params.message);
  }
}

export async function getContactCompanyIdOrThrow(params: {
  contactId: string;
  userId: string;
}): Promise<{ id: string; companyId: string }> {
  const contact = await prisma.contact.findFirst({
    where: { id: params.contactId, company: { userId: params.userId } },
    select: { id: true, companyId: true },
  });

  if (!contact) {
    throw new Error("Contact not found or not owned by user.");
  }

  return contact;
}

export async function assertOfferDetailExistsOrThrow(params: {
  applicationId: string;
  userId: string;
}): Promise<void> {
  const offerDetail = await prisma.offerDetail.findFirst({
    where: { applicationId: params.applicationId, application: { userId: params.userId } },
    select: { applicationId: true },
  });

  if (!offerDetail) {
    throw new Error("Offer detail not found.");
  }
}

export async function assertRejectionDetailExistsOrThrow(params: {
  applicationId: string;
  userId: string;
}): Promise<void> {
  const rejectionDetail = await prisma.rejectionDetail.findFirst({
    where: { applicationId: params.applicationId, application: { userId: params.userId } },
    select: { applicationId: true },
  });

  if (!rejectionDetail) {
    throw new Error("Rejection detail not found.");
  }
}

