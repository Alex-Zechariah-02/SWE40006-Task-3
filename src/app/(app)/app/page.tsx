import { getDashboardData } from "@/lib/db/dashboard";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { DashboardCards } from "@/features/dashboard/DashboardCards";
import { NextUpSection } from "@/features/dashboard/NextUpSection";
import { QuickActionsPanel } from "@/features/dashboard/QuickActionsPanel";
import { UrgentActionsSection } from "@/features/dashboard/UrgentActionsSection";
import { RecentActivitySection } from "@/features/dashboard/RecentActivitySection";

import { PageHeader } from "@/components/shared/PageHeader";
import { PageContainer } from "@/components/shared/PageContainer";

export default async function Page() {
  const session = await getSessionOrRedirect("/app");
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return null;

  const data = await getDashboardData(userId);

  return (
    <PageContainer width="wide">
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Welcome back — here's your pipeline overview." />
        <UrgentActionsSection items={data.urgentActionItems} />

        <DashboardCards
          activeApplications={data.activeApplications}
          upcomingInterviews={data.upcomingInterviews}
          deadlinesNear={data.deadlinesNear}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
          <div className="h-full lg:col-span-2">
            <NextUpSection nextInterview={data.nextInterview} nearestDeadline={data.nearestDeadline} />
          </div>
          <div className="h-full">
            <QuickActionsPanel />
          </div>
        </div>

        <RecentActivitySection activities={data.recentActivity} />
      </div>
    </PageContainer>
  );
}
