"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchiveButton } from "@/components/app/ArchiveButton";
import { ApplicationEditModal } from "./ApplicationEditModal";
import { LabelValue } from "@/components/shared/LabelValue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { InterviewList } from "@/features/interviews/InterviewList";
import { ActionItemModal } from "@/features/actions/ActionItemModal";
import { OfferDetailModal } from "@/features/applications/OfferDetailModal";
import { RejectionDetailModal } from "@/features/applications/RejectionDetailModal";
import { Pencil, Plus, Link2, Unlink2, Trash2 } from "lucide-react";

interface ApplicationDetailData {
  id: string;
  currentStage: string;
  priority: string;
  appliedDate: string | null;
  statusNotes: string | null;
  tags: string[];
  archivedAt: string | null;
  createdAt: string;
  opportunity: { id: string; title: string };
  company: { id: string; name: string };
  interviews: Array<{
    id: string;
    interviewType: string;
    scheduledAt: string;
    locationOrLink: string | null;
    status: string;
    notes: string | null;
  }>;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
  }>;
  companyContacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
  }>;
  actionItems: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueAt: string | null;
  }>;
  offerDetail: {
    id: string;
    offeredDate: string | null;
    compensationNote: string | null;
    responseDeadline: string | null;
    decisionStatus: string;
    notes: string | null;
  } | null;
  rejectionDetail: {
    id: string;
    rejectionDate: string | null;
    rejectedAtStage: string;
    notes: string | null;
  } | null;
}

const STAGE_LABELS: Record<string, string> = {
  Applied: "Applied",
  Assessment: "Assessment",
  Interview: "Interview",
  Offer: "Offer",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",
};

const PRIORITY_LABELS: Record<string, string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};

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

  async function handleLinkContact(contactId: string) {
    const res = await fetch(`/api/applications/${application.id}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to link contact.");
      return;
    }

    toast.success("Contact linked.");
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
      toast.error(data.error?.message || "Failed to unlink contact.");
      return;
    }

    toast.success("Contact unlinked.");
    router.refresh();
  }

  async function handleDeleteActionItem(id: string) {
    const res = await fetch(`/api/actions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to delete action item.");
      return;
    }
    toast.success("Action item deleted.");
    router.refresh();
  }

  async function handleRemoveOfferDetail() {
    if (!confirm("Remove offer detail?")) return;
    const res = await fetch(`/api/applications/${application.id}/offer`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to remove offer detail.");
      return;
    }
    toast.success("Offer detail removed.");
    router.refresh();
  }

  async function handleRemoveRejectionDetail() {
    if (!confirm("Remove rejection detail?")) return;
    const res = await fetch(`/api/applications/${application.id}/rejection`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to remove rejection detail.");
      return;
    }
    toast.success("Rejection detail removed.");
    router.refresh();
  }

  const interviewOptions = React.useMemo(
    () =>
      application.interviews.map((i) => ({
        id: i.id,
        label: `${i.interviewType} • ${new Date(i.scheduledAt).toLocaleString("en-GB")}`,
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
      {/* Header with actions */}
      <div className="flex items-start justify-between gap-4 pb-6">
        <div>
          <h1 className="type-h1 font-semibold">{application.opportunity.title}</h1>
          <p className="mt-1 type-body text-muted-foreground">
            <a
              href={`/app/companies/${application.company.id}`}
              className="hover:text-foreground transition-colors"
            >
              {application.company.name}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>
          <ArchiveButton
            isArchived={!!application.archivedAt}
            entityLabel="Application"
            onConfirm={handleArchive}
          />
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 pb-6">
        <Badge variant="secondary">
          {STAGE_LABELS[application.currentStage] || application.currentStage}
        </Badge>
        <Badge
          variant={
            application.priority === "High"
              ? "destructive"
              : application.priority === "Medium"
                ? "default"
                : "outline"
          }
        >
          {PRIORITY_LABELS[application.priority] || application.priority}
        </Badge>
        {application.archivedAt && (
          <Badge variant="outline" className="text-muted-foreground">
            Archived
          </Badge>
        )}
      </div>

      {/* Detail grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <DetailField
          label="STAGE"
          value={
            STAGE_LABELS[application.currentStage] || application.currentStage
          }
        />
        <DetailField
          label="PRIORITY"
          value={
            PRIORITY_LABELS[application.priority] || application.priority
          }
        />
        <DetailField
          label="APPLIED"
          value={
            application.appliedDate
              ? new Date(application.appliedDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null
          }
        />
        <DetailField
          label="CREATED"
          value={new Date(application.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
      </div>

      {/* Tags */}
      {application.tags.length > 0 && (
        <div className="pt-6">
          <p className="type-mono-label text-muted-foreground pb-2">TAGS</p>
          <div className="flex flex-wrap gap-1.5">
            {application.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Status notes */}
      {application.statusNotes && (
        <div className="pt-6">
          <p className="type-mono-label text-muted-foreground pb-2">
            STATUS NOTES
          </p>
          <p className="type-body text-foreground/90 whitespace-pre-wrap">
            {application.statusNotes}
          </p>
        </div>
      )}

      {/* Interviews section */}
      <div className="pt-6">
        <InterviewList
          interviews={application.interviews}
          applicationId={application.id}
        />
      </div>

      {/* Contacts section */}
      <div className="pt-6">
        <div className="flex items-center justify-between pb-3">
          <p className="type-mono-label text-muted-foreground">
            CONTACTS ({application.contacts.length})
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLinkContactOpen(true)}
            disabled={linkableContacts.length === 0}
          >
            <Link2 className="mr-1.5 size-4" />
            Link Contact
          </Button>
        </div>

        {application.contacts.length === 0 ? (
          <p className="type-small text-muted-foreground">No contacts linked.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {application.contacts.map((contact) => (
              <div key={contact.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="type-body font-medium">{contact.name}</span>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {contact.title && (
                        <LabelValue label="TITLE" value={contact.title} />
                      )}
                      {contact.email && (
                        <LabelValue label="EMAIL" value={contact.email} />
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:text-foreground"
                    onClick={() => handleUnlinkContact(contact.id)}
                    aria-label="Unlink contact"
                  >
                    <Unlink2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action items section */}
      <div className="pt-6">
        <div className="flex items-center justify-between pb-3">
          <p className="type-mono-label text-muted-foreground">
            ACTION ITEMS ({application.actionItems.length})
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActionCreateOpen(true)}
          >
            <Plus className="mr-1.5 size-4" />
            Add Action
          </Button>
        </div>

        {application.actionItems.length === 0 ? (
          <p className="type-small text-muted-foreground">No action items.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {application.actionItems.map((item) => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="type-body font-medium">{item.title}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge variant="outline">{item.status}</Badge>
                    <Badge
                      variant={
                        item.priority === "High"
                          ? "destructive"
                          : item.priority === "Medium"
                            ? "default"
                            : "outline"
                      }
                    >
                      {item.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => setActionEditItem(item)}
                      aria-label="Edit action item"
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteActionItem(item.id)}
                      aria-label="Delete action item"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-1 type-small text-muted-foreground whitespace-pre-wrap">
                    {item.description}
                  </p>
                )}
                {item.dueAt && (
                  <p className="mt-1 type-small text-muted-foreground">
                    Due:{" "}
                    {new Date(item.dueAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offer detail */}
      {application.currentStage === "Offer" && (
        <div className="pt-6">
          <div className="flex items-center justify-between pb-3">
            <p className="type-mono-label text-muted-foreground">OFFER DETAIL</p>
            <div className="flex items-center gap-2">
              {application.offerDetail ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferOpen(true)}
                  >
                    <Pencil className="mr-1.5 size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveOfferDetail}
                  >
                    <Trash2 className="mr-1.5 size-4" />
                    Remove
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOfferOpen(true)}
                >
                  <Plus className="mr-1.5 size-4" />
                  Add
                </Button>
              )}
            </div>
          </div>

          {application.offerDetail ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label="OFFERED"
                  value={
                    application.offerDetail.offeredDate
                      ? new Date(application.offerDetail.offeredDate).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "long", year: "numeric" }
                        )
                      : null
                  }
                />
                <DetailField
                  label="DECISION"
                  value={application.offerDetail.decisionStatus}
                />
                <DetailField
                  label="RESPONSE DEADLINE"
                  value={
                    application.offerDetail.responseDeadline
                      ? new Date(
                          application.offerDetail.responseDeadline
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : null
                  }
                />
              </div>
              {application.offerDetail.compensationNote && (
                <div className="mt-4">
                  <p className="type-mono-label text-muted-foreground pb-1">
                    COMPENSATION
                  </p>
                  <p className="type-body text-foreground/90 whitespace-pre-wrap">
                    {application.offerDetail.compensationNote}
                  </p>
                </div>
              )}
              {application.offerDetail.notes && (
                <div className="mt-4">
                  <p className="type-mono-label text-muted-foreground pb-1">
                    NOTES
                  </p>
                  <p className="type-body text-foreground/90 whitespace-pre-wrap">
                    {application.offerDetail.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4">
              <p className="type-body text-muted-foreground">
                Add offer details to record dates, compensation notes, and your decision.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rejection detail */}
      {application.currentStage === "Rejected" && (
        <div className="pt-6">
          <div className="flex items-center justify-between pb-3">
            <p className="type-mono-label text-muted-foreground">
              REJECTION DETAIL
            </p>
            <div className="flex items-center gap-2">
              {application.rejectionDetail ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRejectionOpen(true)}
                  >
                    <Pencil className="mr-1.5 size-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveRejectionDetail}
                  >
                    <Trash2 className="mr-1.5 size-4" />
                    Remove
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRejectionOpen(true)}
                >
                  <Plus className="mr-1.5 size-4" />
                  Add
                </Button>
              )}
            </div>
          </div>

          {application.rejectionDetail ? (
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailField
                  label="REJECTED"
                  value={
                    application.rejectionDetail.rejectionDate
                      ? new Date(
                          application.rejectionDetail.rejectionDate
                        ).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : null
                  }
                />
                <DetailField
                  label="AT STAGE"
                  value={application.rejectionDetail.rejectedAtStage}
                />
              </div>
              {application.rejectionDetail.notes && (
                <div className="mt-4">
                  <p className="type-mono-label text-muted-foreground pb-1">
                    NOTES
                  </p>
                  <p className="type-body text-foreground/90 whitespace-pre-wrap">
                    {application.rejectionDetail.notes}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 p-4">
              <p className="type-body text-muted-foreground">
                Add rejection details to record what stage you reached and any notes.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit modal */}
      <ApplicationEditModal
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

function ContactLinkModal({
  open,
  onOpenChange,
  contacts,
  onLink,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
    phone: string | null;
  }>;
  onLink: (contactId: string) => Promise<void>;
}) {
  const [contactId, setContactId] = React.useState<string>("");
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (open) setContactId("");
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactId) return;
    setPending(true);
    try {
      await onLink(contactId);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Link contact</DialogTitle>
          <DialogDescription>
            Link a company contact to this application.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Contact</Label>
            <Select value={contactId} onValueChange={(v) => setContactId(v ?? "")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a contact..." />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.title ? ` • ${c.title}` : ""}
                    {c.email ? ` • ${c.email}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!contactId || pending}>
              {pending ? "Linking..." : "Link contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="type-mono-label text-muted-foreground pb-1">{label}</p>
      <p className="type-body">{value}</p>
    </div>
  );
}
