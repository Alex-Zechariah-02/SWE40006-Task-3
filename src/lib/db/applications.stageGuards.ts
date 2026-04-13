import "server-only";

import type { ApplicationStage } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type StageGuardResult =
  | { ok: true }
  | { ok: false; status: 404 | 409; message: string };

export async function guardApplicationStageChange(params: {
  applicationId: string;
  userId: string;
  nextStage: ApplicationStage;
}): Promise<StageGuardResult> {
  const current = await prisma.application.findFirst({
    where: { id: params.applicationId, userId: params.userId },
    select: {
      id: true,
      currentStage: true,
      offerDetail: { select: { id: true } },
      rejectionDetail: { select: { id: true } },
    },
  });

  if (!current) {
    return { ok: false, status: 404, message: "Application not found." };
  }

  if (current.offerDetail && params.nextStage !== "Offer") {
    return {
      ok: false,
      status: 409,
      message:
        "Stage change blocked. Remove offer detail before changing away from Offer.",
    };
  }

  if (current.rejectionDetail && params.nextStage !== "Rejected") {
    return {
      ok: false,
      status: 409,
      message:
        "Stage change blocked. Remove rejection detail before changing away from Rejected.",
    };
  }

  return { ok: true };
}

