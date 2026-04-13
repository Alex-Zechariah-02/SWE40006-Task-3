"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StageBadge } from "@/components/ui/stage-badge";
import { Calendar } from "lucide-react";

interface ApplicationCardProps {
  id: string;
  opportunityTitle: string;
  companyName: string;
  companyId: string;
  currentStage: string;
  priority: string;
  appliedDate: string | null;
  tags: string[];
  archivedAt: string | null;
}

export function ApplicationCard({
  id,
  opportunityTitle,
  companyName,
  companyId,
  currentStage,
  priority,
  appliedDate,
  tags,
  archivedAt,
}: ApplicationCardProps) {
  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40 hover-lift">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/app/applications/${id}`}
          className="type-body font-medium text-foreground hover:text-primary transition-colors truncate"
        >
          {opportunityTitle}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <StageBadge stage={currentStage} />
          <PriorityBadge priority={priority} />
        </div>
      </div>

      {/* Company */}
      <div className="mt-2">
        <Link
          href={`/app/companies/${companyId}`}
          className="type-small text-muted-foreground hover:text-foreground transition-colors"
        >
          {companyName}
        </Link>
      </div>

      {/* Meta info */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        {appliedDate && (
          <span className="inline-flex items-center gap-1 type-small text-muted-foreground">
            <Calendar className="size-3" />
            {new Date(appliedDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-3 border-t border-border pt-3 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline" className="type-small">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Archived indicator */}
      {archivedAt && (
        <div className="mt-2">
          <Badge variant="outline" className="type-small text-muted-foreground">
            Archived
          </Badge>
        </div>
      )}
    </div>
  );
}
