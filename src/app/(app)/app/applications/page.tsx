import { PageHeader } from "@/components/shared/PageHeader";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { listApplications } from "@/lib/db/applications";
import { ApplicationListSurface } from "@/features/applications/ApplicationListSurface";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/applications");
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return null;

  const applications = await listApplications(user.id, { includeArchived: true });

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
    opportunity: a.opportunity,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Applications"
        description="Track your active and past applications."
      />
      <ApplicationListSurface applications={serialized} />
    </div>
  );
}
