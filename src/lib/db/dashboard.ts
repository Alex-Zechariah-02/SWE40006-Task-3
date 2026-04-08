import "server-only";

import { prisma } from "@/lib/prisma";

export interface DashboardData {
  activeApplications: number;
  upcomingInterviews: number;
  followUpsDue: number;
  deadlinesNear: number;
  savedOpportunities: number;
  nextInterview: {
    id: string;
    interviewType: string;
    scheduledAt: string;
    applicationTitle: string;
    companyName: string;
  } | null;
  nearestDeadline: {
    id: string;
    title: string;
    companyName: string;
    deadline: string;
  } | null;
  urgentActionItems: Array<{
    id: string;
    title: string;
    dueAt: string;
    priority: string;
    status: string;
    isOverdue: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    type: "opportunity" | "application";
    title: string;
    detail: string;
    updatedAt: string;
  }>;
  companyWatchlist: Array<{
    id: string;
    name: string;
    activeApplications: number;
    upcomingDeadlines: number;
  }>;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const fourteenDaysFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const [
    activeApplications,
    upcomingInterviews,
    followUpsDue,
    deadlinesNear,
    savedOpportunities,
    nextInterview,
    nearestDeadline,
    urgentActionItems,
    recentOpportunities,
    recentApplications,
    companyWatchlist,
  ] = await Promise.all([
    prisma.application.count({
      where: {
        userId,
        currentStage: { notIn: ["Offer", "Rejected", "Withdrawn"] },
        archivedAt: null,
      },
    }),

    prisma.interview.count({
      where: {
        scheduledAt: { gte: now },
        application: {
          userId,
          archivedAt: null,
        },
      },
    }),

    prisma.actionItem.count({
      where: {
        userId,
        status: { in: ["Open", "InProgress"] },
        dueAt: { not: null, lte: threeDaysFromNow },
      },
    }),

    prisma.opportunity.count({
      where: {
        userId,
        deadline: { not: null, lte: sevenDaysFromNow },
        stage: { in: ["Saved", "Shortlisted"] },
        archivedAt: null,
      },
    }),

    prisma.opportunity.count({
      where: {
        userId,
        stage: { in: ["Saved", "Shortlisted"] },
        archivedAt: null,
      },
    }),

    prisma.interview.findFirst({
      where: {
        scheduledAt: { gte: now },
        application: {
          userId,
          archivedAt: null,
        },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        interviewType: true,
        scheduledAt: true,
        application: {
          select: {
            opportunity: { select: { title: true } },
            company: { select: { name: true } },
          },
        },
      },
    }),

    prisma.opportunity.findFirst({
      where: {
        userId,
        deadline: { not: null, gt: now },
        archivedAt: null,
      },
      orderBy: { deadline: "asc" },
      select: {
        id: true,
        title: true,
        deadline: true,
        company: { select: { name: true } },
      },
    }),

    prisma.actionItem.findMany({
      where: {
        userId,
        dueAt: { not: null, lte: fortyEightHoursFromNow },
      },
      orderBy: { dueAt: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        dueAt: true,
        priority: true,
        status: true,
      },
    }),

    prisma.opportunity.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        id: true,
        title: true,
        stage: true,
        updatedAt: true,
        company: { select: { name: true } },
      },
    }),

    prisma.application.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      orderBy: { updatedAt: "desc" },
      take: 4,
      select: {
        id: true,
        currentStage: true,
        updatedAt: true,
        opportunity: { select: { title: true } },
        company: { select: { name: true } },
      },
    }),

    prisma.company.findMany({
      where: {
        userId,
        archivedAt: null,
        OR: [
          {
            applications: {
              some: {
                archivedAt: null,
                currentStage: { notIn: ["Offer", "Rejected", "Withdrawn"] },
              },
            },
          },
          {
            opportunities: {
              some: {
                archivedAt: null,
                deadline: { not: null, lte: fourteenDaysFromNow },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            applications: {
              where: {
                archivedAt: null,
                currentStage: { notIn: ["Offer", "Rejected", "Withdrawn"] },
              },
            },
            opportunities: {
              where: {
                archivedAt: null,
                deadline: { not: null, lte: fourteenDaysFromNow },
              },
            },
          },
        },
      },
      orderBy: {
        applications: {
          _count: "desc",
        },
      },
      take: 5,
    }),
  ]);

  const recentActivity = [...recentOpportunities.map((opp) => ({
    id: opp.id,
    type: "opportunity" as const,
    title: opp.title,
    detail: `${opp.company.name} \u2022 ${opp.stage}`,
    updatedAt: opp.updatedAt.toISOString(),
  })), ...recentApplications.map((app) => ({
    id: app.id,
    type: "application" as const,
    title: app.opportunity.title,
    detail: `${app.company.name} \u2022 ${app.currentStage}`,
    updatedAt: app.updatedAt.toISOString(),
  }))].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 8);

  return {
    activeApplications,
    upcomingInterviews,
    followUpsDue,
    deadlinesNear,
    savedOpportunities,
    nextInterview: nextInterview
      ? {
          id: nextInterview.id,
          interviewType: nextInterview.interviewType,
          scheduledAt: nextInterview.scheduledAt.toISOString(),
          applicationTitle: nextInterview.application.opportunity.title,
          companyName: nextInterview.application.company.name,
        }
      : null,
    nearestDeadline: nearestDeadline
      ? {
          id: nearestDeadline.id,
          title: nearestDeadline.title,
          companyName: nearestDeadline.company.name,
          deadline: nearestDeadline.deadline!.toISOString(),
        }
      : null,
    urgentActionItems: urgentActionItems.map((item) => ({
      id: item.id,
      title: item.title,
      dueAt: item.dueAt!.toISOString(),
      priority: item.priority,
      status: item.status,
      isOverdue: item.dueAt! <= now,
    })),
    recentActivity,
    companyWatchlist: companyWatchlist.map((company) => ({
      id: company.id,
      name: company.name,
      activeApplications: company._count.applications,
      upcomingDeadlines: company._count.opportunities,
    })),
  };
}
