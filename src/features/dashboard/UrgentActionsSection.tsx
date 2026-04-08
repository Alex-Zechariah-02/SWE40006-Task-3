"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";

interface UrgentActionsSectionProps {
  items: Array<{
    id: string;
    title: string;
    dueAt: string;
    priority: string;
    status: string;
    isOverdue: boolean;
  }>;
}

function formatDate(isoString: string): string {
  if (!isoString) return "No deadline";
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function priorityLabel(priority: string): string {
  switch (priority) {
    case "High":
      return "High";
    case "Medium":
      return "Med";
    case "Low":
      return "Low";
    default:
      return priority;
  }
}

function priorityColor(priority: string): string {
  switch (priority) {
    case "High":
      return "text-status-danger";
    case "Medium":
      return "text-status-warning";
    case "Low":
      return "text-status-success";
    default:
      return "text-muted-foreground";
  }
}

export function UrgentActionsSection({ items }: UrgentActionsSectionProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No urgent actions."
        description="Stay on top of your pipeline tasks."
        action={
          <Link
            href="/app/actions?status=openWork&dueWindow=dueSoon&sort=dueDate"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View actions
          </Link>
        }
      />
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="type-mono-label text-muted-foreground">Urgent Actions</p>
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3"
            >
              <Link
                href="/app/actions"
                className="type-body font-medium text-foreground transition-colors hover:text-primary"
              >
                {item.title}
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`type-mono-label ${priorityColor(item.priority)}`}
                >
                  {priorityLabel(item.priority)}
                </span>
                {item.isOverdue && (
                  <span className="type-mono-label rounded bg-status-danger/10 px-1.5 py-0.5 text-status-danger">
                    Overdue
                  </span>
                )}
                <span className="type-mono-label text-muted-foreground">
                  {formatDate(item.dueAt)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
