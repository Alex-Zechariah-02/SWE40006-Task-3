"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApplicationEditModal } from "./ApplicationEditModal";
import { InterviewList } from "@/features/interviews/InterviewList";
import { ActionItemModal } from "@/features/actions/ActionItemModal";
import { OfferDetailModal } from "@/features/applications/OfferDetailModal";
import { RejectionDetailModal } from "@/features/applications/RejectionDetailModal";
import type { ApplicationDetailData } from "./detail/types";
import { ContactLinkModal } from "./detail/ContactLinkModal";
import { ApplicationDetailHeader } from "./detail/ApplicationDetailHeader";
import { ApplicationMetaSection } from "./detail/ApplicationMetaSection";
import { ApplicationContactsSection } from "./detail/ApplicationContactsSection";
import { ApplicationActionItemsSection } from "./detail/ApplicationActionItemsSection";
import { ApplicationOfferDetailSection } from "./detail/ApplicationOfferDetailSection";
import { ApplicationRejectionDetailSection } from "./detail/ApplicationRejectionDetailSection";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StageTimeline } from "@/components/ui/stage-timeline";
import { getInterviewTypeLabel } from "@/features/interviews/interviewLabels";

export function ApplicationDetailSurface({
  application,
}: {
  application: ApplicationDetailData;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [linkContactOpen, setLinkContactOpen] = React.useState(false);
  const [offerOpen, setOfferOpen] = React.useState(false);
  const [rejectionOpen, setRejectionOpen] = React.useState(false);
  const [actionCreateOpen, setActionCreateOpen] = React.useState(false);
  const [actionEditItem, setActionEditItem] = React.useState<
    ApplicationDetailData["actionItems"][number] | null
  >(null);

  async function handleArchive() {
    const action = application.archivedAt ? "unarchive" : "archive";
    const res = await fetch(`/api/applications/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      toast.error("Failed to update.");
      return;
    }
    toast.success(action === "archive" ? "Archived." : "Restored.");
    router.refresh();
  }

  async function handleDelete() {
    const res = await fetch(`/api/applications/${application.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to delete.");
      return;
    }
    toast.success("Deleted.");
    router.replace("/app/applications");
  }

  async function handleLinkContact(contactId: string) {
    const res = await fetch(`/api/applications/${application.id}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to link.");
      return;
    }

    toast.success("Linked.");
    setLinkContactOpen(false);
    router.refresh();
  }

  async function handleUnlinkContact(contactId: string) {
    const res = await fetch(
      `/api/applications/${application.id}/contacts?contactId=${encodeURIComponent(contactId)}`,
      { method: "DELETE" }
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to unlink.");
      return;
    }

    toast.success("Unlinked.");
    router.refresh();
  }

  async function handleDeleteActionItem(id: string) {
    const res = await fetch(`/api/actions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to delete.");
      return;
    }
    toast.success("Deleted.");
    router.refresh();
  }

  async function handleRemoveOfferDetail() {
    if (!confirm("Remove offer detail?")) return;
    const res = await fetch(`/api/applications/${application.id}/offer`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to remove.");
      return;
    }
    toast.success("Removed.");
    router.refresh();
  }

  async function handleRemoveRejectionDetail() {
    if (!confirm("Remove rejection detail?")) return;
    const res = await fetch(`/api/applications/${application.id}/rejection`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to remove.");
      return;
    }
    toast.success("Removed.");
    router.refresh();
  }

  const interviewOptions = React.useMemo(
    () =>
      application.interviews.map((i) => ({
        id: i.id,
        label: `${getInterviewTypeLabel(i.interviewType)} • ${new Date(i.scheduledAt).toLocaleString("en-GB")}`,
      })),
    [application.interviews]
  );

  const linkedContactIds = React.useMemo(
    () => new Set(application.contacts.map((c) => c.id)),
    [application.contacts]
  );

  const linkableContacts = React.useMemo(
    () => application.companyContacts.filter((c) => !linkedContactIds.has(c.id)),
    [application.companyContacts, linkedContactIds]
  );

  return (
    <>
      <ApplicationDetailHeader
        opportunityTitle={application.opportunity.title}
        company={application.company}
        currentStage={application.currentStage}
        priority={application.priority}
        archivedAt={application.archivedAt}
        isArchived={!!application.archivedAt}
        onEdit={() => setEditOpen(true)}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <StageTimeline currentStage={application.currentStage} className="mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interviews section */}
          <Card>
            <CardContent className="pt-6">
              <InterviewList
                interviews={application.interviews}
                applicationId={application.id}
              />
            </CardContent>
          </Card>

          {/* Action items */}
          <ApplicationActionItemsSection
            actionItems={application.actionItems}
            onRequestCreate={() => setActionCreateOpen(true)}
            onRequestEdit={(item) => setActionEditItem(item)}
            onDelete={handleDeleteActionItem}
          />

          {/* Offer detail */}
          {application.currentStage === "Offer" && (
            <ApplicationOfferDetailSection
              offerDetail={application.offerDetail}
              onRequestOpen={() => setOfferOpen(true)}
              onRemove={handleRemoveOfferDetail}
            />
          )}

          {/* Rejection detail */}
          {application.currentStage === "Rejected" && (
            <ApplicationRejectionDetailSection
              rejectionDetail={application.rejectionDetail}
              onRequestOpen={() => setRejectionOpen(true)}
              onRemove={handleRemoveRejectionDetail}
            />
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Details card */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplicationMetaSection
                currentStage={application.currentStage}
                priority={application.priority}
                appliedDate={application.appliedDate}
                createdAt={application.createdAt}
                tags={application.tags}
                statusNotes={application.statusNotes}
              />
            </CardContent>
          </Card>

          {/* Contacts card */}
          <ApplicationContactsSection
            contacts={application.contacts}
            canLinkContact={linkableContacts.length > 0}
            onRequestLink={() => setLinkContactOpen(true)}
            onUnlink={handleUnlinkContact}
          />
        </div>
      </div>

      {/* Edit modal */}
      <ApplicationEditModal
        key={application.id}
        application={application}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Contact link modal */}
      <ContactLinkModal
        open={linkContactOpen}
        onOpenChange={setLinkContactOpen}
        contacts={linkableContacts}
        onLink={handleLinkContact}
      />

      {/* Offer / Rejection modals */}
      <OfferDetailModal
        applicationId={application.id}
        offerDetail={application.offerDetail}
        open={offerOpen}
        onOpenChange={setOfferOpen}
      />
      <RejectionDetailModal
        applicationId={application.id}
        rejectionDetail={application.rejectionDetail}
        open={rejectionOpen}
        onOpenChange={setRejectionOpen}
      />

      {/* Action item modals */}
      <ActionItemModal
        open={actionCreateOpen}
        onOpenChange={setActionCreateOpen}
        mode="create"
        prelinkedCompanyId={application.company.id}
        prelinkedOpportunityId={application.opportunity.id}
        prelinkedApplicationId={application.id}
        companies={[{ id: application.company.id, label: application.company.name }]}
        opportunities={[
          { id: application.opportunity.id, label: application.opportunity.title },
        ]}
        applications={[{ id: application.id, label: application.opportunity.title }]}
        interviews={interviewOptions}
      />

      {actionEditItem && (
        <ActionItemModal
          key={actionEditItem.id}
          open={!!actionEditItem}
          onOpenChange={(open) => {
            if (!open) setActionEditItem(null);
          }}
          mode="edit"
          existingItem={{
            id: actionEditItem.id,
            title: actionEditItem.title,
            description: actionEditItem.description,
            dueAt: actionEditItem.dueAt,
            priority: actionEditItem.priority,
            status: actionEditItem.status,
          }}
        />
      )}
    </>
  );
}
