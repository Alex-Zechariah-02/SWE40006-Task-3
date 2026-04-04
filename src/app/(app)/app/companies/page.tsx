import { PageHeader } from "@/components/shared/PageHeader";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { listCompanies } from "@/lib/db/companies";
import { CompanyListSurface } from "@/features/companies/CompanyListSurface";
import { CompanyCreateModal } from "@/features/companies/CompanyCreateModal";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/companies");
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return null;

  const companies = await listCompanies(user.id);

  const serialized = companies.map((c) => ({
    id: c.id,
    name: c.name,
    location: c.location,
    industry: c.industry,
    _count: c._count,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Companies"
        description="Companies you are tracking."
        action={<CompanyCreateModal />}
      />
      <CompanyListSurface companies={serialized} />
    </div>
  );
}
