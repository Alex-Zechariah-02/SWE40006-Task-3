"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Flag, Pencil, Trash2 } from "lucide-react";
import type { ActionItemRow, BadgeVariant } from "./types";

const PRIORITY_CONFIG: Record<string, { label: string; variant: BadgeVariant }> =
  {
    High: { label: "High", variant: "destructive" },
    Medium: { label: "Medium", variant: "default" },
    Low: { label: "Low", variant: "outline" },
  };

const STATUS_CONFIG: Record<string, { label: string; variant: BadgeVariant }> = {
  Open: { label: "Open", variant: "outline" },
  InProgress: { label: "In Progress", variant: "default" },
  Completed: { label: "Completed", variant: "success" },
  Cancelled: { label: "Cancelled", variant: "outline" },
};

export function ActionItemRowItem({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: ActionItemRow;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const priorityCfg = PRIORITY_CONFIG[item.priority] ?? {
    label: item.priority,
    variant: "outline" as const,
  };
  const statusCfg = STATUS_CONFIG[item.status] ?? {
    label: item.status,
    variant: "outline" as const,
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = item.dueAt ? new Date(item.dueAt) : null;
  const dueDateDay = dueDate
    ? new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
    : null;
  const isActive =
    item.status !== "Completed" && item.status !== "Cancelled";
  const isOverdue = dueDateDay !== null && dueDateDay < today && isActive;
  const isDueToday =
    dueDateDay !== null &&
    dueDateDay.getTime() === today.getTime() &&
    isActive;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 px-4 py-4 transition-colors duration-100 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        isOverdue && "border-l-2 border-destructive",
      )}
    >
      <div className="min-w-0 flex-1">
        <span className="font-semibold text-sm text-foreground truncate block">
          {item.title}
        </span>

        {(item.company || item.opportunity) && (
          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 type-small text-muted-foreground">
            {item.company && (
              <Link
                href={`/app/companies/${item.company.id}`}
                className="hover:text-foreground transition-colors"
              >
                {item.company.name}
              </Link>
            )}
            {item.company && item.opportunity && (
              <span aria-hidden="true">·</span>
            )}
            {item.opportunity && (
              <Link
                href={`/app/opportunities/${item.opportunity.id}`}
                className="hover:text-foreground transition-colors"
              >
                {item.opportunity.title}
              </Link>
            )}
          </div>
        )}

        {item.description && (
          <p className="type-small text-muted-foreground line-clamp-1 mt-1">
            {item.description}
          </p>
        )}

        <div className="mt-2 grid grid-flow-col auto-cols-max items-center gap-2 md:grid-flow-row md:grid-cols-[13ch_9ch]">
          <Badge
            variant={statusCfg.variant}
            className="type-badge md:w-full md:justify-center"
          >
            {statusCfg.label}
          </Badge>
          <Badge
            variant={priorityCfg.variant}
            className="type-badge gap-1 md:w-full md:justify-center"
          >
            <Flag className="size-3" />
            {priorityCfg.label}
          </Badge>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 pt-1">
        {item.dueAt && (
          <span
            className={cn(
              "type-caption tabular-nums inline-flex items-center gap-1",
              isOverdue
                ? "text-destructive font-medium"
                : isDueToday
                  ? "text-status-warning"
                  : "text-muted-foreground",
            )}
          >
            <Calendar className="size-3" />
            {new Date(item.dueAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onEdit}
          disabled={isDeleting}
          aria-label={`Edit ${item.title}`}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={`Delete ${item.title}`}
          title="Delete"
          className="size-8 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
