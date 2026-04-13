import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const PRIORITY_LABELS: Record<string, string> = {
  High: "High",
  Medium: "Medium",
  Low: "Low",
};

const PRIORITY_VARIANTS: Record<
  string,
  "destructive" | "default" | "outline"
> = {
  High: "destructive",
  Medium: "default",
  Low: "outline",
};

interface PriorityBadgeProps {
  priority: string;
  className?: string;
  children?: React.ReactNode;
}

export function PriorityBadge({
  priority,
  className,
  children,
}: PriorityBadgeProps) {
  const variant = PRIORITY_VARIANTS[priority] ?? "secondary";
  const label = PRIORITY_LABELS[priority] ?? priority;

  return (
    <Badge variant={variant} className={cn(children && "gap-1", className)}>
      {children}
      {label}
    </Badge>
  );
}
