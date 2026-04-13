"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import {
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";
import { formatShortDate } from "@/lib/ui/formatRelativeTime";

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
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="type-section-label text-muted-foreground">
          Follow-ups Due
        </CardTitle>
        {items.length > 0 && (
          <CardAction>
            <span className="type-section-label text-muted-foreground">
              {items.length}
            </span>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="type-small text-muted-foreground py-2">
            All caught up — no follow-ups due.
          </p>
        ) : (
          <>
            <motion.ul
              className="grid gap-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {items.slice(0, 5).map((item) => (
                <motion.li
                  key={item.id}
                  className="flex items-start justify-between gap-2"
                  variants={staggerItem}
                  transition={
                    shouldReduceMotion
                      ? reducedMotionTransition
                      : staggerItemTransition
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="type-small font-medium leading-tight truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {item.isOverdue && (
                        <span className="type-mono-label text-[0.65rem] rounded bg-status-danger/10 px-1 py-px text-status-danger">
                          Overdue
                        </span>
                      )}
                      <span className={`type-mono-label text-[0.65rem] ${priorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                  </div>
                  <span className="type-mono-label shrink-0 text-muted-foreground">
                    {formatShortDate(item.dueAt)}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
            <Link
              href="/app/actions?status=openWork&dueWindow=overdue&sort=dueDate"
              className={buttonVariants({ variant: "link", size: "sm" }) + " mt-2 px-0"}
            >
              View all →
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
