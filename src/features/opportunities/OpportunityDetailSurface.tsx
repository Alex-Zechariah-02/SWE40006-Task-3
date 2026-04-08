"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchiveButton } from "@/components/app/ArchiveButton";
import { OpportunityEditModal } from "./OpportunityEditModal";
import { ApplicationConvertModal } from "@/features/applications/ApplicationConvertModal";
import { Pencil, ExternalLink, FileText, CheckCircle2 } from "lucide-react";

interface OpportunityDetailData {
  id: string;
  title: string;
  opportunityType: string;
  remoteMode: string;
  stage: string;
  sourceType: string;
  sourceUrl: string | null;
  sourceProvider: string;
  location: string | null;
  deadline: string | null;
  snippet: string | null;
  description: string | null;
  notes: string | null;
  tags: string[];
  importedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  company: { id: string; name: string };
  application: { id: string; currentStage: string } | null;
}

const TYPE_LABELS: Record<string, string> = {
  Internship: "Internship",
  GraduateProgram: "Graduate Program",
  FullTime: "Full-time",
  PartTime: "Part-time",
  Contract: "Contract",
};

const REMOTE_LABELS: Record<string, string> = {
  OnSite: "On-site",
  Hybrid: "Hybrid",
  Remote: "Remote",
};

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

  return (
    <>
      {/* Header with actions */}
      <div className="flex items-start justify-between gap-4 pb-6">
        <div>
          <h1 className="type-h1 font-semibold">{opportunity.title}</h1>
          <p className="mt-1 type-body text-muted-foreground">
            <a
              href={`/app/companies/${opportunity.company.id}`}
              className="hover:text-foreground transition-colors"
            >
              {opportunity.company.name}
            </a>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!opportunity.application ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setConvertOpen(true)}
            >
              <FileText className="mr-1.5 size-4" />
              Convert to Application
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 type-small text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
                Already converted
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/app/applications/${opportunity.application!.id}`)
                }
              >
                View application
              </Button>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>
          <ArchiveButton
            isArchived={!!opportunity.archivedAt}
            entityLabel="Opportunity"
            onConfirm={handleArchive}
          />
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 pb-6">
        <Badge variant="secondary">{opportunity.stage}</Badge>
        <Badge variant="outline">
          {TYPE_LABELS[opportunity.opportunityType] || opportunity.opportunityType}
        </Badge>
        <Badge variant="outline">
          {REMOTE_LABELS[opportunity.remoteMode] || opportunity.remoteMode}
        </Badge>
        <Badge variant="outline">{opportunity.sourceType}</Badge>
        {opportunity.archivedAt && (
          <Badge variant="destructive">Archived</Badge>
        )}
        {opportunity.application && (
          <Badge variant="default">
            Application: {opportunity.application.currentStage}
          </Badge>
        )}
      </div>

      {/* Detail grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        <DetailField label="LOCATION" value={opportunity.location} />
        <DetailField
          label="DEADLINE"
          value={
            opportunity.deadline
              ? new Date(opportunity.deadline).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : null
          }
        />
        <DetailField label="SOURCE PROVIDER" value={opportunity.sourceProvider} />
        {opportunity.sourceUrl && (
          <div>
            <p className="type-mono-label text-muted-foreground pb-1">SOURCE URL</p>
            <a
              href={opportunity.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="type-small text-primary hover:underline inline-flex items-center gap-1"
            >
              {new URL(opportunity.sourceUrl).hostname}
              <ExternalLink className="size-3" />
            </a>
          </div>
        )}
        {opportunity.importedAt && (
          <DetailField
            label="IMPORTED"
            value={new Date(opportunity.importedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
        )}
        <DetailField
          label="SAVED"
          value={new Date(opportunity.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        />
      </div>

      {/* Tags */}
      {opportunity.tags.length > 0 && (
        <div className="pt-6">
          <p className="type-mono-label text-muted-foreground pb-2">TAGS</p>
          <div className="flex flex-wrap gap-1.5">
            {opportunity.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Long text fields */}
      {opportunity.snippet && (
        <div className="pt-6">
          <p className="type-mono-label text-muted-foreground pb-2">SNIPPET</p>
          <p className="type-body text-foreground/90 whitespace-pre-wrap">
            {opportunity.snippet}
          </p>
        </div>
      )}

      {opportunity.description && (
        <div className="pt-6">
          <p className="type-mono-label text-muted-foreground pb-2">
            DESCRIPTION
          </p>
          <p className="type-body text-foreground/90 whitespace-pre-wrap">
            {opportunity.description}
          </p>
        </div>
      )}

      {opportunity.notes && (
        <div className="pt-6">
          <p className="type-mono-label text-muted-foreground pb-2">NOTES</p>
          <p className="type-body text-foreground/90 whitespace-pre-wrap">
            {opportunity.notes}
          </p>
        </div>
      )}

      {/* Edit modal */}
      <OpportunityEditModal
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
