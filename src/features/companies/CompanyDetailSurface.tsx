"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  NOTE_FIELDS,
  type CompanyDetailData,
  type CompanyNoteFieldKey,
} from "./detail/companyDetailTypes";
import { CompanyDetailHeader } from "./detail/CompanyDetailHeader";
import { CompanyResearchNotesCard } from "./detail/CompanyResearchNotesCard";
import { CompanyLinkedOpportunitiesCard } from "./detail/CompanyLinkedOpportunitiesCard";
import { CompanyApplicationsCard } from "./detail/CompanyApplicationsCard";
import { CompanyDetailsCard } from "./detail/CompanyDetailsCard";
import { CompanyContactsCard } from "./detail/CompanyContactsCard";

export function CompanyDetailSurface({
  company,
}: {
  company: CompanyDetailData;
}) {
  const router = useRouter();
  const [notes, setNotes] = React.useState<Record<CompanyNoteFieldKey, string>>(
    () => {
      const init = {} as Record<CompanyNoteFieldKey, string>;
      for (const f of NOTE_FIELDS) {
        init[f.key] = company[f.key] ?? "";
      }
      return init;
    }
  );
  const [saving, setSaving] = React.useState(false);

  const dirty = NOTE_FIELDS.some(
    (f) => notes[f.key] !== (company[f.key] ?? "")
  );

  function handleNoteChange(key: CompanyNoteFieldKey, value: string) {
    setNotes((prev) => ({ ...prev, [key]: value }));
  }

  async function saveNotes() {
    setSaving(true);
    try {
      const body: Record<string, string | null> = {};
      for (const f of NOTE_FIELDS) {
        body[f.key] = notes[f.key] || null;
      }

      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        toast.error("Failed to save notes.");
        return;
      }

      toast.success("Notes saved.");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleArchive() {
    const action = company.archivedAt ? "unarchive" : "archive";
    const res = await fetch(`/api/companies/${company.id}`, {
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
    const res = await fetch(`/api/companies/${company.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(
        data.error?.message ||
          "Failed to delete company."
      );
      return;
    }
    toast.success("Company deleted.");
    router.replace("/app/companies");
  }

  return (
    <>
      <CompanyDetailHeader
        companyName={company.name}
        archivedAt={company.archivedAt}
        website={company.website}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notes editor */}
          <CompanyResearchNotesCard
            notes={notes}
            dirty={dirty}
            saving={saving}
            onSave={saveNotes}
            onChangeNote={handleNoteChange}
          />

          {/* Linked opportunities */}
          <CompanyLinkedOpportunitiesCard opportunities={company.opportunities} />

          <CompanyApplicationsCard
            applications={company.applications}
            applicationCount={company._count.applications}
          />
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Company metadata */}
          <CompanyDetailsCard
            industry={company.industry}
            location={company.location}
            website={company.website}
            applicationCount={company._count.applications}
          />

          {/* Contacts */}
          <CompanyContactsCard contacts={company.contacts} />
        </div>
      </div>
    </>
  );
}
