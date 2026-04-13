import "server-only";

import { prisma } from "@/lib/prisma";
import type { DashboardData } from "./dashboard.types";
import {
  buildRecentActivity,
  type RecentApplicationRow,
  type RecentOpportunityRow,
} from "./dashboard.recentActivity";
import { getDashboardWindows } from "./dashboard.windows";

export type { DashboardData } from "./dashboard.types";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const { now, startToday, fortyEightHoursFromNow, fourteenDaysFromNow, deadlinesNearUntil } =
    getDashboardWindows();

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
        scheduledAt: { gte: startToday },
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
        dueAt: { not: null, lt: startToday },
      },
    }),

    prisma.opportunity.count({
      where: {
        userId,
        deadline: { not: null, gte: startToday, lte: deadlinesNearUntil },
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

  const recentActivity = buildRecentActivity(
    recentOpportunities as RecentOpportunityRow[],
    recentApplications as RecentApplicationRow[]
  );

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
