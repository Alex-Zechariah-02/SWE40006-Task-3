import type { Prisma } from "@prisma/client";

export const APPLICATION_LIST_INCLUDE: Prisma.ApplicationInclude = {
  company: { select: { id: true, name: true } },
  opportunity: {
    select: { id: true, title: true, opportunityType: true, deadline: true },
  },
};

export const APPLICATION_DETAIL_INCLUDE: Prisma.ApplicationInclude = {
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
};

