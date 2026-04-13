"use client";

import { Badge } from "@/components/ui/badge";
import { StageBadge } from "@/components/ui/stage-badge";
import { TypeBadge } from "@/components/ui/type-badge";

const REMOTE_LABELS: Record<string, string> = {
  OnSite: "On-site",
  Hybrid: "Hybrid",
  Remote: "Remote",
};

type Props = {
  stage: string;
  opportunityType: string;
  remoteMode: string;
  sourceType: string;
  archivedAt: string | null;
  hasApplication: boolean;
};

export function OpportunityStatusBadges({
  stage,
  opportunityType,
  remoteMode,
  sourceType,
  archivedAt,
  hasApplication,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2 pb-6">
      <StageBadge stage={stage} />
      <TypeBadge type={opportunityType} />
      <Badge variant="outline">{REMOTE_LABELS[remoteMode] || remoteMode}</Badge>
      <Badge variant="outline">{sourceType}</Badge>
      {archivedAt && <Badge variant="destructive">Archived</Badge>}
      {hasApplication && <Badge variant="default">Linked application</Badge>}
    </div>
  );
}
