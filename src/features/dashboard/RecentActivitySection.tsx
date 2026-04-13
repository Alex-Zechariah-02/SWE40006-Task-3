"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Lightbulb, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import {
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";
import { formatRelativeTime } from "@/lib/ui/formatRelativeTime";

interface RecentActivitySectionProps {
  activities: Array<{
    id: string;
    type: string;
    title: string;
    detail: string;
    updatedAt: string;
  }>;
}


function activityIcon(type: string) {
  return type === "opportunity" ? Lightbulb : Briefcase;
}

export function RecentActivitySection({
  activities,
}: RecentActivitySectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (activities.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No recent activity."
        description="Your pipeline activity will appear here."
        action={
          <Link
            href="/search"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Find opportunities
          </Link>
        }
      />
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="type-section-label text-muted-foreground">
          Recent Activity
        </p>
        <motion.ul
          className="mt-3 divide-y divide-border"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {activities.map((activity) => {
            const Icon = activityIcon(activity.type);
            return (
              <motion.li
                key={activity.id}
                className="flex items-start gap-3 py-3 first:pt-0 interactive-row rounded-md hover:bg-muted/30"
                variants={staggerItem}
                transition={
                  shouldReduceMotion
                    ? reducedMotionTransition
                    : staggerItemTransition
                }
              >
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="type-body font-medium leading-tight">
                    {activity.title}
                  </p>
                  <p className="type-small text-muted-foreground">
                    {activity.detail}
                  </p>
                </div>
                <span className="type-mono-label shrink-0 text-muted-foreground">
                  {formatRelativeTime(activity.updatedAt)}
                </span>
              </motion.li>
            );
          })}
        </motion.ul>
      </CardContent>
    </Card>
  );
}
