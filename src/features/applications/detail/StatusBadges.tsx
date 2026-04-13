"use client";

import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StageBadge } from "@/components/ui/stage-badge";

export function StatusBadges({
  currentStage,
  priority,
  archivedAt,
}: {
  currentStage: string;
  priority: string;
  archivedAt: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2 pb-6">
      <StageBadge stage={currentStage} />
      <PriorityBadge priority={priority} />
      {archivedAt && (
        <Badge variant="outline" className="text-muted-foreground">
          Archived
        </Badge>
      )}
    </div>
  );
}
