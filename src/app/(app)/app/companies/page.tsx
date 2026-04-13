import { PageHeader } from "@/components/shared/PageHeader";
import { PageContainer } from "@/components/shared/PageContainer";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { listCompanies } from "@/lib/db/companies";
import { CompanyListSurface } from "@/features/companies/CompanyListSurface";
import { CompanyCreateModal } from "@/features/companies/CompanyCreateModal";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/companies");
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return null;

  const companies = await listCompanies(userId);

  const serialized = companies.map((c) => ({
    id: c.id,
    name: c.name,
    location: c.location,
    industry: c.industry,
    _count: c._count,
  }));

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Companies"
        description="Companies you are tracking."
        action={<CompanyCreateModal />}
      />
      <CompanyListSurface companies={serialized} />
    </PageContainer>
  );
}
