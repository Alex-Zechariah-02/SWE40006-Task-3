"use client";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { ArchiveButton } from "@/components/app/ArchiveButton";
import { DeleteButton } from "@/components/app/DeleteButton";
import { ExternalLink } from "lucide-react";

type Props = {
  companyName: string;
  archivedAt: string | null;
  website: string | null;
  onArchive: () => Promise<void>;
  onDelete: () => Promise<void>;
};

export function CompanyDetailHeader({
  companyName,
  archivedAt,
  website,
  onArchive,
  onDelete,
}: Props) {
  return (
    <div className="space-y-4 pb-6">
      <Breadcrumb
        items={[
          { label: "Companies", href: "/app/companies" },
          { label: companyName },
        ]}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="type-h2">{companyName}</h1>
            {archivedAt && <Badge variant="destructive">Archived</Badge>}
          </div>
          {website && (
            <div className="mt-1 flex items-center gap-2">
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 type-small text-primary hover:underline"
              >
                {new URL(website).hostname}
                <ExternalLink className="size-3" />
              </a>
              <CopyButton value={website} label="website URL" />
            </div>
          )}
        </div>
        <div className="flex flex-wrap shrink-0 items-center gap-2">
          <ArchiveButton
            isArchived={!!archivedAt}
            entityLabel="Company"
            onConfirm={onArchive}
          />
          <DeleteButton
            entityLabel="Company"
            entityName={companyName}
            description={`"${companyName}" will be permanently deleted. This cannot be undone. Companies with linked opportunities, applications, or contacts cannot be deleted — remove those first.`}
            onConfirm={onDelete}
          />
        </div>
      </div>
    </div>
  );
}
