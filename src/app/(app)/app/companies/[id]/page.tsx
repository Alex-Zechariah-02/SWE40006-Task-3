import { notFound } from "next/navigation";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getCompany } from "@/lib/db/companies";
import { CompanyDetailSurface } from "@/features/companies/CompanyDetailSurface";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionOrRedirect(`/app/companies/${id}`);
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return notFound();

  const company = await getCompany(id, user.id);
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
    opportunities: company.opportunities.map((o) => ({
      id: o.id,
      title: o.title,
      stage: o.stage,
      opportunityType: o.opportunityType,
    })),
    _count: company._count,
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <CompanyDetailSurface company={serialized} />
    </div>
  );
}
