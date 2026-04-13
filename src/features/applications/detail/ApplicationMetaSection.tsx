"use client";

import { Badge } from "@/components/ui/badge";
import { DetailField } from "./DetailField";
import {
  APPLICATION_PRIORITY_LABELS,
  APPLICATION_STAGE_LABELS,
} from "../applicationLabels";

export function ApplicationMetaSection({
  currentStage,
  priority,
  appliedDate,
  createdAt,
  tags,
  statusNotes,
}: {
  currentStage: string;
  priority: string;
  appliedDate: string | null;
  createdAt: string;
  tags: string[];
  statusNotes: string | null;
}) {
  return (
    <dl className="space-y-3">
      <DetailField
        label="Stage"
        value={APPLICATION_STAGE_LABELS[currentStage] || currentStage}
      />
      <DetailField
        label="Priority"
        value={APPLICATION_PRIORITY_LABELS[priority] || priority}
      />
      <DetailField
        label="Applied"
        value={
          appliedDate
            ? new Date(appliedDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : null
        }
      />
      <DetailField
        label="Created"
        value={new Date(createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      />

      {tags.length > 0 && (
        <div>
          <dt className="type-caption font-medium text-muted-foreground">Tags</dt>
          <dd className="mt-1 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </dd>
        </div>
      )}

      {statusNotes && (
        <div>
          <dt className="type-caption font-medium text-muted-foreground">
            Status notes
          </dt>
          <dd className="mt-1">
            <p className="type-body text-foreground/90 whitespace-pre-wrap">
              {statusNotes}
            </p>
          </dd>
        </div>
      )}
    </dl>
  );
}

