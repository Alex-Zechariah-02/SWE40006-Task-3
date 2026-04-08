import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  headingAs?: "h2" | "h3";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  headingAs = "h2",
  className,
}: EmptyStateProps) {
  const Heading = headingAs;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className
      )}
    >
      {Icon && (
        <Icon className="mb-3 h-10 w-10 text-muted-foreground/50" aria-hidden />
      )}
      <Heading className="type-h3 font-medium">{title}</Heading>
      {description && (
        <p className="mt-1 max-w-sm type-body text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
