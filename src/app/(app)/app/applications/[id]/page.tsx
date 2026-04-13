import { notFound } from "next/navigation";
import { getSessionOrRedirect } from "@/lib/auth/session";
import { getUserIdFromSessionOrNull } from "@/lib/auth/user";
import { getApplication } from "@/lib/db/applications";
import { listContacts } from "@/lib/db/contacts";
import { ApplicationDetailSurface } from "@/features/applications/ApplicationDetailSurface";
import { PageContainer } from "@/components/shared/PageContainer";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const session = await getSessionOrRedirect(`/app/applications/${id}`);
  const userId = await getUserIdFromSessionOrNull(session);
  if (!userId) return notFound();

  const application = await getApplication(id, userId);
  if (!application) return notFound();

  const companyContacts = await listContacts(userId, {
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
    <PageContainer width="default">
      <ApplicationDetailSurface application={serialized} />
    </PageContainer>
  );
}
