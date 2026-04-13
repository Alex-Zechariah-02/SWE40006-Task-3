import { PageHeader } from "@/components/shared/PageHeader";
import { PageContainer } from "@/components/shared/PageContainer";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { listApplications } from "@/lib/db/applications";
import { ApplicationListSurface } from "@/features/applications/ApplicationListSurface";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/applications");
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return null;

  const applications = await listApplications(userId, { includeArchived: true });

  const serialized = applications.map((a) => ({
    id: a.id,
    currentStage: a.currentStage,
    priority: a.priority,
    tags: a.tags,
    appliedDate: a.appliedDate ? a.appliedDate.toISOString() : null,
    statusNotes: a.statusNotes,
    archivedAt: a.archivedAt ? a.archivedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    company: a.company,
    opportunity: {
      id: a.opportunity.id,
      title: a.opportunity.title,
      opportunityType: a.opportunity.opportunityType,
      deadline: a.opportunity.deadline ? a.opportunity.deadline.toISOString() : null,
    },
  }));

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Applications"
        description="Track your active and past applications."
      />
      <ApplicationListSurface applications={serialized} />
    </PageContainer>
  );
}
