import { PageHeader } from "@/components/shared/PageHeader";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { listOpportunities } from "@/lib/db/opportunities";
import { OpportunityListSurface } from "@/features/opportunities/OpportunityListSurface";
import { OpportunityCreateModal } from "@/features/opportunities/OpportunityCreateModal";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/opportunities");
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return null;

  const opportunities = await listOpportunities(user.id);

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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Opportunities"
        description="Saved and discovered roles."
        action={<OpportunityCreateModal />}
      />
      <OpportunityListSurface opportunities={serialized} />
    </div>
  );
}
