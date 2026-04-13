import { notFound } from "next/navigation";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { getCompany } from "@/lib/db/companies";
import { CompanyDetailSurface } from "@/features/companies/CompanyDetailSurface";
import { PageContainer } from "@/components/shared/PageContainer";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionOrRedirect(`/app/companies/${id}`);
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return notFound();

  const company = await getCompany(id, userId);
  if (!company) return notFound();

  const serialized = {
    id: company.id,
    name: company.name,
    website: company.website,
    location: company.location,
    industry: company.industry,
    techStackNotes: company.techStackNotes,
    applicationProcessNotes: company.applicationProcessNotes,
    interviewNotes: company.interviewNotes,
    compensationNotes: company.compensationNotes,
    generalNotes: company.generalNotes,
    archivedAt: company.archivedAt ? company.archivedAt.toISOString() : null,
    contacts: company.contacts.map((c) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      email: c.email,
    })),
    applications: company.applications.map((application) => ({
      id: application.id,
      currentStage: application.currentStage,
      priority: application.priority,
      appliedDate: application.appliedDate
        ? application.appliedDate.toISOString()
        : null,
      opportunity: application.opportunity,
    })),
    opportunities: company.opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      stage: o.stage,
      opportunityType: o.opportunityType,
    })),
    _count: company._count,
  };

  return (
    <PageContainer width="default">
      <CompanyDetailSurface company={serialized} />
    </PageContainer>
  );
}
