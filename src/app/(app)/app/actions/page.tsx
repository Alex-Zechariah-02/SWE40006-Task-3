import { PageHeader } from "@/components/shared/PageHeader";
import { PageContainer } from "@/components/shared/PageContainer";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { listActionItems } from "@/lib/db/actions";
import { listCompanies } from "@/lib/db/companies";
import { listOpportunities } from "@/lib/db/opportunities";
import { listApplications } from "@/lib/db/applications";
import { listInterviews } from "@/lib/db/interviews";
import { ActionItemListSurface } from "@/features/actions/ActionItemListSurface";
import { ActionHeader } from "./ActionHeader";
import { getInterviewTypeLabel } from "@/features/interviews/interviewLabels";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/actions");
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return null;

  const [actionItems, companies, opportunities, applications, interviews] =
    await Promise.all([
      listActionItems(userId),
      listCompanies(userId, { sort: "name" }),
      listOpportunities(userId, { sort: "company" }),
      listApplications(userId, { sort: "company" }),
      listInterviews(userId),
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
      label: `${getInterviewTypeLabel(i.interviewType)} • ${i.scheduledAt.toLocaleString("en-GB")}`,
    })),
  };

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Actions"
        description="Upcoming tasks and reminders."
        action={<ActionHeader linkOptions={linkOptions} />}
      />
      <ActionItemListSurface actionItems={serialized} linkOptions={linkOptions} />
    </PageContainer>
  );
}
