import { PageHeader } from "@/components/shared/PageHeader";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { listContacts } from "@/lib/db/contacts";
import { listCompanies } from "@/lib/db/companies";
import { ContactListSurface } from "@/features/contacts/ContactListSurface";
import { ContactCreateModal } from "@/features/contacts/ContactCreateModal";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const session = await getSessionOrRedirect("/app/contacts");
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return null;

  const [contacts, companies] = await Promise.all([
    listContacts(user.id),
    listCompanies(user.id),
  ]);

  const serializedContacts = contacts.map((c) => ({
    id: c.id,
    name: c.name,
    title: c.title,
    email: c.email,
    phone: c.phone,
    company: c.company,
  }));

  const companyOptions = companies.map((c) => ({
    id: c.id,
    name: c.name,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Contacts"
        description="People at your tracked companies."
        action={<ContactCreateModal companies={companyOptions} />}
      />
      <ContactListSurface
        contacts={serializedContacts}
        companies={companyOptions}
      />
    </div>
  );
}
