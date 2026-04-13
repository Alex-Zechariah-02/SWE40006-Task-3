"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { OpportunityEditModal } from "./OpportunityEditModal";
import { ApplicationConvertModal } from "@/features/applications/ApplicationConvertModal";
import type { OpportunityDetailData } from "./detail/opportunityDetailTypes";
import { OpportunityDetailHeader } from "./detail/OpportunityDetailHeader";
import { OpportunityStatusBadges } from "./detail/OpportunityStatusBadges";
import { OpportunityDetailsCard } from "./detail/OpportunityDetailsCard";

export function OpportunityDetailSurface({
  opportunity,
}: {
  opportunity: OpportunityDetailData;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = React.useState(false);
  const [convertOpen, setConvertOpen] = React.useState(false);

  async function handleArchive() {
    const action = opportunity.archivedAt ? "unarchive" : "archive";
    const res = await fetch(`/api/opportunities/${opportunity.id}`, {
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
    const res = await fetch(`/api/opportunities/${opportunity.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error?.message || "Failed to delete opportunity.");
      return;
    }
    toast.success("Opportunity deleted.");
    router.replace("/app/opportunities");
  }

  return (
    <>
      <OpportunityDetailHeader
        title={opportunity.title}
        company={opportunity.company}
        application={opportunity.application}
        archivedAt={opportunity.archivedAt}
        onOpenConvert={() => setConvertOpen(true)}
        onOpenEdit={() => setEditOpen(true)}
        onViewApplication={() => {
          if (!opportunity.application) return;
          router.push(`/app/applications/${opportunity.application.id}`);
        }}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <OpportunityStatusBadges
        stage={opportunity.stage}
        opportunityType={opportunity.opportunityType}
        remoteMode={opportunity.remoteMode}
        sourceType={opportunity.sourceType}
        archivedAt={opportunity.archivedAt}
        hasApplication={!!opportunity.application}
      />

      <OpportunityDetailsCard opportunity={opportunity} />

      {/* Edit modal */}
      <OpportunityEditModal
        key={opportunity.id}
        opportunity={opportunity}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Convert to Application modal */}
      {!opportunity.application && (
        <ApplicationConvertModal
          opportunityId={opportunity.id}
          opportunityTitle={opportunity.title}
          companyName={opportunity.company.name}
          open={convertOpen}
          onOpenChange={setConvertOpen}
        />
      )}
    </>
  );
}
