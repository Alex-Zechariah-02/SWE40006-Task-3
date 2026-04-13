import { notFound } from "next/navigation";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { getOpportunity } from "@/lib/db/opportunities";
import { OpportunityDetailSurface } from "@/features/opportunities/OpportunityDetailSurface";
import { PageContainer } from "@/components/shared/PageContainer";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionOrRedirect(`/app/opportunities/${id}`);
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return notFound();

  const opportunity = await getOpportunity(id, userId);
  if (!opportunity) return notFound();

  const serialized = {
    id: opportunity.id,
    title: opportunity.title,
    opportunityType: opportunity.opportunityType,
    remoteMode: opportunity.remoteMode,
    stage: opportunity.stage,
    sourceType: opportunity.sourceType,
    sourceUrl: opportunity.sourceUrl,
    sourceProvider: opportunity.sourceProvider,
    location: opportunity.location,
    deadline: opportunity.deadline ? opportunity.deadline.toISOString() : null,
    snippet: opportunity.snippet,
    description: opportunity.description,
    notes: opportunity.notes,
    tags: opportunity.tags,
    importedAt: opportunity.importedAt
      ? opportunity.importedAt.toISOString()
      : null,
    archivedAt: opportunity.archivedAt
      ? opportunity.archivedAt.toISOString()
      : null,
    createdAt: opportunity.createdAt.toISOString(),
    company: opportunity.company,
    application: opportunity.application
      ? {
          ...opportunity.application,
          appliedDate: opportunity.application.appliedDate
            ? opportunity.application.appliedDate.toISOString()
            : null,
        }
      : null,
  };

  return (
    <PageContainer width="default">
      <OpportunityDetailSurface opportunity={serialized} />
    </PageContainer>
  );
}
