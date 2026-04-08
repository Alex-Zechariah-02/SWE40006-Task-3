import { getDashboardData } from "@/lib/db/dashboard";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { DashboardCards } from "@/features/dashboard/DashboardCards";
import { NextUpSection } from "@/features/dashboard/NextUpSection";
import { UrgentActionsSection } from "@/features/dashboard/UrgentActionsSection";
import { RecentActivitySection } from "@/features/dashboard/RecentActivitySection";
import { CompanyWatchlistSection } from "@/features/dashboard/CompanyWatchlistSection";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function Page() {
  const session = await getSessionOrRedirect("/app");
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });
  if (!user) return null;

  const data = await getDashboardData(user.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 space-y-8">
      <PageHeader title="Dashboard" description="Your career pipeline at a glance." />
      <DashboardCards
        activeApplications={data.activeApplications}
        upcomingInterviews={data.upcomingInterviews}
        followUpsDue={data.followUpsDue}
        deadlinesNear={data.deadlinesNear}
        savedOpportunities={data.savedOpportunities}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <NextUpSection nextInterview={data.nextInterview} nearestDeadline={data.nearestDeadline} />
        <UrgentActionsSection items={data.urgentActionItems} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivitySection activities={data.recentActivity} />
        <CompanyWatchlistSection companies={data.companyWatchlist} />
      </div>
    </div>
  );
}
