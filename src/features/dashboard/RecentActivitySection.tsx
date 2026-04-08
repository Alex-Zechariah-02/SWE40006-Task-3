"use client";

import Link from "next/link";
import { Lightbulb, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";

interface RecentActivitySectionProps {
  activities: Array<{
    id: string;
    type: string;
    title: string;
    detail: string;
    updatedAt: string;
  }>;
}

function relativeTime(isoString: string): string {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
  return then.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function activityIcon(type: string) {
  return type === "opportunity" ? Lightbulb : Briefcase;
}

export function RecentActivitySection({
  activities,
}: RecentActivitySectionProps) {
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
        <p className="type-mono-label text-muted-foreground">
          Recent Activity
        </p>
        <ul className="mt-3 space-y-3">
          {activities.map((activity) => {
            const Icon = activityIcon(activity.type);
            return (
              <li key={activity.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
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
                  {relativeTime(activity.updatedAt)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
