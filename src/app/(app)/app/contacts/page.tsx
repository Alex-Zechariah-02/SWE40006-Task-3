import { PageHeader } from "@/components/shared/PageHeader";
import { PageContainer } from "@/components/shared/PageContainer";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { listContacts } from "@/lib/db/contacts";
import { listCompanies } from "@/lib/db/companies";
import { ContactListSurface } from "@/features/contacts/ContactListSurface";
import { ContactCreateModal } from "@/features/contacts/ContactCreateModal";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/contacts");
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return null;

  const [contacts, companies] = await Promise.all([
    listContacts(userId),
    listCompanies(userId),
  ]);

  const serializedContacts = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    email: c.email,
    phone: c.phone,
    linkedinUrl: c.linkedinUrl,
    notes: c.notes,
    company: c.company,
  }));

  const companyOptions = companies.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Contacts"
        description="People at your tracked companies."
        action={<ContactCreateModal companies={companyOptions} />}
      />
      <ContactListSurface
        contacts={serializedContacts}
        companies={companyOptions}
      />
    </PageContainer>
  );
}
