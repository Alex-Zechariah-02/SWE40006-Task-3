"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArchiveButton } from "@/components/app/ArchiveButton";
import { DeleteButton } from "@/components/app/DeleteButton";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StageBadge } from "@/components/ui/stage-badge";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Pencil } from "lucide-react";

export function ApplicationDetailHeader({
  opportunityTitle,
  company,
  currentStage,
  priority,
  archivedAt,
  isArchived,
  onEdit,
  onArchive,
  onDelete,
}: {
  opportunityTitle: string;
  company: { id: string; name: string };
  currentStage: string;
  priority: string;
  archivedAt: string | null;
  isArchived: boolean;
  onEdit: () => void;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  return (
    <div className="space-y-4 pb-6">
      <Breadcrumb
        items={[
          { label: "Applications", href: "/app/applications" },
          { label: opportunityTitle },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="type-h2">{opportunityTitle}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <StageBadge stage={currentStage} />
              <PriorityBadge priority={priority} />
              {archivedAt && (
                <Badge variant="outline" className="text-muted-foreground">
                  Archived
                </Badge>
              )}
            </div>
          </div>
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
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-1.5 size-4" />
            Edit
          </Button>
          <ArchiveButton
            isArchived={isArchived}
            entityLabel="Application"
            onConfirm={onArchive}
          />
          <DeleteButton
            entityLabel="Application"
            entityName={opportunityTitle}
            description={`The application for "${opportunityTitle}" at ${company.name} will be permanently deleted, including all interviews, offer/rejection details, and linked action items. This cannot be undone.`}
            onConfirm={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
