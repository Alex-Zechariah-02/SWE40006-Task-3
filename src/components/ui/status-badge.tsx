import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  Open: "Open",
  InProgress: "In Progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

const STATUS_VARIANTS: Record<string, "warning" | "default" | "success" | "ghost"> = {
  Open: "warning",
  InProgress: "default",
  Completed: "success",
  Cancelled: "ghost",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANTS[status] ?? "secondary";
  const label = STATUS_LABELS[status] ?? status;

  return (
    <Badge variant={variant} className={cn(className)}>
      {label}
    </Badge>
  );
}
