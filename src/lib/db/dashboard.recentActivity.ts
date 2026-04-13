import "server-only";

import type { DashboardData } from "./dashboard.types";

export type RecentOpportunityRow = {
  id: string;
  title: string;
  stage: string;
  updatedAt: Date;
  company: { name: string };
};

export type RecentApplicationRow = {
  id: string;
  currentStage: string;
  updatedAt: Date;
  opportunity: { title: string };
  company: { name: string };
};

export function buildRecentActivity(
  recentOpportunities: RecentOpportunityRow[],
  recentApplications: RecentApplicationRow[]
): DashboardData["recentActivity"] {
  const items: DashboardData["recentActivity"] = [
    ...recentOpportunities.map((opp) => ({
      id: opp.id,
      type: "opportunity" as const,
      title: opp.title,
      detail: `${opp.company.name} \u2022 ${opp.stage}`,
      updatedAt: opp.updatedAt.toISOString(),
    })),
    ...recentApplications.map((app) => ({
      id: app.id,
      type: "application" as const,
      title: app.opportunity.title,
      detail: `${app.company.name} \u2022 ${app.currentStage}`,
      updatedAt: app.updatedAt.toISOString(),
    })),
  ];

  return items
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 8);
}
