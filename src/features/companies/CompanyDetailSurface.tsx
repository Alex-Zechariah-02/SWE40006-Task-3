"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArchiveButton } from "@/components/app/ArchiveButton";
import { LabelValue } from "@/components/shared/LabelValue";
import { Save, ExternalLink } from "lucide-react";

interface CompanyDetailData {
  id: string;
  name: string;
  website: string | null;
  location: string | null;
  industry: string | null;
  techStackNotes: string | null;
  applicationProcessNotes: string | null;
  interviewNotes: string | null;
  compensationNotes: string | null;
  generalNotes: string | null;
  archivedAt: string | null;
  contacts: Array<{
    id: string;
    name: string;
    title: string | null;
    email: string | null;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    stage: string;
    opportunityType: string;
  }>;
  _count: { applications: number };
}

const NOTE_FIELDS = [
  { key: "techStackNotes", label: "Tech Stack" },
  { key: "applicationProcessNotes", label: "Application Process" },
  { key: "interviewNotes", label: "Interview" },
  { key: "compensationNotes", label: "Compensation" },
  { key: "generalNotes", label: "General" },
] as const;

export function CompanyDetailSurface({
  company,
}: {
  company: CompanyDetailData;
}) {
  const router = useRouter();
  const [notes, setNotes] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of NOTE_FIELDS) {
      init[f.key] = (company[f.key] as string) ?? "";
    }
    return init;
  });
  const [saving, setSaving] = React.useState(false);

  const dirty = NOTE_FIELDS.some(
    (f) => notes[f.key] !== ((company[f.key] as string) ?? "")
  );

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

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-6">
        <div>
          <h1 className="type-h1 font-semibold">{company.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {company.industry && (
              <LabelValue label="INDUSTRY" value={company.industry} />
            )}
            {company.location && (
              <LabelValue label="LOC" value={company.location} />
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ArchiveButton
            isArchived={!!company.archivedAt}
            entityLabel="Company"
            onConfirm={handleArchive}
          />
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 pb-6">
        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 type-small text-primary hover:underline"
          >
            {new URL(company.website).hostname}
            <ExternalLink className="size-3" />
          </a>
        )}
        {company.archivedAt && (
          <Badge variant="destructive">Archived</Badge>
        )}
      </div>

      {/* Notes editor */}
      <div className="pb-8">
        <div className="flex items-center justify-between pb-4">
          <h2 className="type-h2 font-semibold">Research Notes</h2>
          {dirty && (
            <Button size="sm" onClick={saveNotes} disabled={saving}>
              <Save className="mr-1.5 size-4" />
              {saving ? "Saving..." : "Save Notes"}
            </Button>
          )}
        </div>
        <div className="grid gap-4">
          {NOTE_FIELDS.map((f) => (
            <div key={f.key} className="grid gap-1.5">
              <label className="type-mono-label text-muted-foreground">
                {f.label.toUpperCase()}
              </label>
              <Textarea
                rows={3}
                value={notes[f.key]}
                onChange={(e) =>
                  setNotes((prev) => ({ ...prev, [f.key]: e.target.value }))
                }
                placeholder={`${f.label} notes...`}
                maxLength={5000}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Linked opportunities */}
      {company.opportunities.length > 0 && (
        <div className="pb-8">
          <h2 className="type-h2 font-semibold pb-3">
            Opportunities ({company.opportunities.length})
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border">
            {company.opportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <Link
                  href={`/app/opportunities/${opp.id}`}
                  className="type-body text-foreground hover:text-primary transition-colors truncate"
                >
                  {opp.title}
                </Link>
                <div className="flex shrink-0 gap-1.5">
                  <Badge variant="secondary">{opp.stage}</Badge>
                  <Badge variant="outline">{opp.opportunityType}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts */}
      {company.contacts.length > 0 && (
        <div className="pb-8">
          <h2 className="type-h2 font-semibold pb-3">
            Contacts ({company.contacts.length})
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border">
            {company.contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className="type-body font-medium">{c.name}</p>
                  {c.title && (
                    <p className="type-small text-muted-foreground">
                      {c.title}
                    </p>
                  )}
                </div>
                {c.email && (
                  <span className="type-small text-muted-foreground truncate">
                    {c.email}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
