import { PageHeader } from "@/components/shared/PageHeader";
import { PageContainer } from "@/components/shared/PageContainer";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { listOpportunities } from "@/lib/db/opportunities";
import { OpportunityListSurface } from "@/features/opportunities/OpportunityListSurface";
import { OpportunityCreateModal } from "@/features/opportunities/OpportunityCreateModal";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/opportunities");
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return null;

  const opportunities = await listOpportunities(userId);

  const serialized = opportunities.map((o) => ({
    id: o.id,
    title: o.title,
    opportunityType: o.opportunityType,
    remoteMode: o.remoteMode,
    stage: o.stage,
    sourceType: o.sourceType,
    location: o.location,
    deadline: o.deadline ? o.deadline.toISOString() : null,
    tags: o.tags,
    createdAt: o.createdAt.toISOString(),
    company: o.company,
  }));

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Opportunities"
        description="Saved and discovered roles."
        action={<OpportunityCreateModal />}
      />
      <OpportunityListSurface opportunities={serialized} />
    </PageContainer>
  );
}
