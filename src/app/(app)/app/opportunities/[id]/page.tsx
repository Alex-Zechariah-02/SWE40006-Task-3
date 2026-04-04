import { notFound } from "next/navigation";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getOpportunity } from "@/lib/db/opportunities";
import { OpportunityDetailSurface } from "@/features/opportunities/OpportunityDetailSurface";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionOrRedirect(`/app/opportunities/${id}`);
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return notFound();

  const opportunity = await getOpportunity(id, user.id);
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
    application: opportunity.application,
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <OpportunityDetailSurface opportunity={serialized} />
    </div>
  );
}
