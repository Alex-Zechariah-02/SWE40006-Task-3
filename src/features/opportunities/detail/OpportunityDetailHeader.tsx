"use client";

import { Button } from "@/components/ui/button";
import { ArchiveButton } from "@/components/app/ArchiveButton";
import { DeleteButton } from "@/components/app/DeleteButton";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StageBadge } from "@/components/ui/stage-badge";
import { Pencil, FileText, CheckCircle2 } from "lucide-react";
import type { OpportunityDetailData } from "./opportunityDetailTypes";

type Props = {
  title: string;
  company: OpportunityDetailData["company"];
  application: OpportunityDetailData["application"];
  archivedAt: string | null;
  onOpenConvert: () => void;
  onOpenEdit: () => void;
  onViewApplication: () => void;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
};

export function OpportunityDetailHeader({
  title,
  company,
  application,
  archivedAt,
  onOpenConvert,
  onOpenEdit,
  onViewApplication,
  onArchive,
  onDelete,
}: Props) {
  return (
    <>
      <div className="pb-2">
        <Breadcrumb
          items={[
            { label: "Opportunities", href: "/app/opportunities" },
            { label: title },
          ]}
        />
      </div>

      <div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="type-h1 font-display font-semibold">{title}</h1>
          <p className="mt-1 type-body text-muted-foreground">
            <a
              href={`/app/companies/${company.id}`}
              className="hover:text-foreground transition-colors"
            >
              {company.name}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap shrink-0 items-center gap-2">
          {!application ? (
            <Button variant="default" size="sm" onClick={onOpenConvert}>
              <FileText className="mr-1.5 size-4" />
              Convert to Application
            </Button>
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-lg border border-border px-3 py-2 sm:items-end">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 type-small text-status-success">
                  <CheckCircle2 className="size-4" />
                  Already converted
                </span>
                <StageBadge stage={application.currentStage} />
                <PriorityBadge priority={application.priority} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {application.appliedDate && (
                  <span className="type-small text-muted-foreground">
                    Applied {new Date(application.appliedDate).toLocaleDateString()}
                  </span>
                )}
                <Button variant="outline" size="sm" onClick={onViewApplication}>
                  View application
                </Button>
              </div>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={onOpenEdit}>
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>
          <ArchiveButton
            isArchived={!!archivedAt}
            entityLabel="Opportunity"
            onConfirm={onArchive}
          />
          <DeleteButton
            entityLabel="Opportunity"
            entityName={title}
            description={
              application
                ? `"${title}" and its linked application will be permanently deleted, including all interviews and related data. This cannot be undone.`
                : `"${title}" will be permanently deleted. This cannot be undone.`
            }
            onConfirm={onDelete}
          />
        </div>
      </div>
    </>
  );
}
