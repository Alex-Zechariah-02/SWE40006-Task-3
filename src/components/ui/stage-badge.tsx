import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STAGE_COLOR_CLASSES: Record<string, string> = {
  Saved: "bg-stage-saved-bg text-stage-saved-fg border-transparent",
  Shortlisted:
    "bg-stage-shortlisted-bg text-stage-shortlisted-fg border-transparent",
  Applied: "bg-stage-applied-bg text-stage-applied-fg border-transparent",
  Assessment:
    "bg-stage-assessment-bg text-stage-assessment-fg border-transparent",
  Interview: "bg-stage-interview-bg text-stage-interview-fg border-transparent",
  Offer: "bg-stage-offer-bg text-stage-offer-fg border-transparent",
  Rejected: "bg-stage-rejected-bg text-stage-rejected-fg border-transparent",
  Withdrawn: "bg-stage-withdrawn-bg text-stage-withdrawn-fg border-transparent",
};

const STAGE_LABELS: Record<string, string> = {
  Saved: "Saved",
  Shortlisted: "Shortlisted",
  Applied: "Applied",
  Assessment: "Assessment",
  Interview: "Interview",
  Offer: "Offer",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",
};

interface StageBadgeProps {
  stage: string;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const colorClasses =
    STAGE_COLOR_CLASSES[stage] ??
    "bg-muted text-muted-foreground border-transparent";
  const label = STAGE_LABELS[stage] ?? stage;

  return <Badge className={cn(colorClasses, className)}>{label}</Badge>;
}
