import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** @deprecated Pass actionLabel + onAction instead */
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-center rounded-full bg-muted p-3">
        <Icon className="size-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="type-h4 font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-2 type-small text-muted-foreground/70 max-w-xs">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          variant="default"
          size="sm"
          className="mt-5"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
