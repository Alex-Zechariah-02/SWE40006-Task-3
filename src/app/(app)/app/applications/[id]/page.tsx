import { notFound } from "next/navigation";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getApplication } from "@/lib/db/applications";
import { listContacts } from "@/lib/db/contacts";
import { ApplicationDetailSurface } from "@/features/applications/ApplicationDetailSurface";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionOrRedirect(`/app/applications/${id}`);
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? "" },
    select: { id: true },
  });

  if (!user) return notFound();

  const application = await getApplication(id, user.id);
  if (!application) return notFound();

  const companyContacts = await listContacts(user.id, {
    companyId: application.company.id,
  });

  const serialized = {
    id: application.id,
    currentStage: application.currentStage,
    priority: application.priority,
    tags: application.tags,
    appliedDate: application.appliedDate
      ? application.appliedDate.toISOString()
      : null,
    statusNotes: application.statusNotes,
    archivedAt: application.archivedAt
      ? application.archivedAt.toISOString()
      : null,
    createdAt: application.createdAt.toISOString(),
    company: application.company,
    opportunity: application.opportunity,
    interviews: application.interviews.map((i) => ({
      id: i.id,
      interviewType: i.interviewType,
      scheduledAt: i.scheduledAt.toISOString(),
      locationOrLink: i.locationOrLink,
      status: i.status,
      notes: i.notes,
    })),
    contacts: application.contacts,
    companyContacts: companyContacts.map((c) => ({
      id: c.id,
      name: c.name,
      title: c.title,
      email: c.email,
      phone: c.phone,
    })),
    actionItems: application.actionItems.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      dueAt: a.dueAt ? a.dueAt.toISOString() : null,
      priority: a.priority,
      status: a.status,
    })),
    offerDetail: application.offerDetail
      ? {
          id: application.offerDetail.id,
          offeredDate: application.offerDetail.offeredDate
            ? application.offerDetail.offeredDate.toISOString()
            : null,
          compensationNote: application.offerDetail.compensationNote,
          responseDeadline: application.offerDetail.responseDeadline
            ? application.offerDetail.responseDeadline.toISOString()
            : null,
          decisionStatus: application.offerDetail.decisionStatus,
          notes: application.offerDetail.notes,
        }
      : null,
    rejectionDetail: application.rejectionDetail
      ? {
          id: application.rejectionDetail.id,
          rejectionDate: application.rejectionDetail.rejectionDate
            ? application.rejectionDetail.rejectionDate.toISOString()
            : null,
          rejectedAtStage: application.rejectionDetail.rejectedAtStage,
          notes: application.rejectionDetail.notes,
        }
      : null,
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <ApplicationDetailSurface application={serialized} />
    </div>
  );
}
