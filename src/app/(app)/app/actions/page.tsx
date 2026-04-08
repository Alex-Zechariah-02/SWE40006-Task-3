import { PageHeader } from "@/components/shared/PageHeader";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { listActionItems } from "@/lib/db/actions";
import { listCompanies } from "@/lib/db/companies";
import { listOpportunities } from "@/lib/db/opportunities";
import { listApplications } from "@/lib/db/applications";
import { listInterviews } from "@/lib/db/interviews";
import { ActionItemListSurface } from "@/features/actions/ActionItemListSurface";
import { ActionHeader } from "./ActionHeader";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/actions");
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return null;

  const [actionItems, companies, opportunities, applications, interviews] =
    await Promise.all([
      listActionItems(user.id),
      listCompanies(user.id, { sort: "name" }),
      listOpportunities(user.id, { sort: "company" }),
      listApplications(user.id, { sort: "company" }),
      listInterviews(user.id),
    ]);

  const serialized = actionItems.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    dueAt: a.dueAt ? a.dueAt.toISOString() : null,
    priority: a.priority,
    status: a.status,
    suggestedBySystem: a.suggestedBySystem,
    createdAt: a.createdAt.toISOString(),
    company: a.company,
    opportunity: a.opportunity,
    application: a.application,
    interview: a.interview,
  }));

  const linkOptions = {
    companies: companies.map((c) => ({ id: c.id, label: c.name })),
    opportunities: opportunities.map((o) => ({
      id: o.id,
      label: `${o.title} • ${o.company.name}`,
    })),
    applications: applications.map((a) => ({
      id: a.id,
      label: `${a.opportunity.title} • ${a.company.name}`,
    })),
    interviews: interviews.map((i) => ({
      id: i.id,
      label: `${i.interviewType} • ${i.scheduledAt.toLocaleString("en-GB")}`,
    })),
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Actions"
        description="Upcoming tasks and reminders."
        action={<ActionHeader linkOptions={linkOptions} />}
      />
      <ActionItemListSurface actionItems={serialized} linkOptions={linkOptions} />
    </div>
  );
}
