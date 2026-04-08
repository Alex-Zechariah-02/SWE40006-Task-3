"use client";

import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";

interface NextUpSectionProps {
  nextInterview: {
    interviewType: string;
    scheduledAt: string;
    applicationTitle: string;
    companyName: string;
  } | null;
  nearestDeadline: {
    title: string;
    companyName: string;
    deadline: string;
  } | null;
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NextUpSection({
  nextInterview,
  nearestDeadline,
}: NextUpSectionProps) {
  if (!nextInterview && !nearestDeadline) {
    return (
      <EmptyState
        icon={Calendar}
        title="No upcoming events."
        description="Interviews and deadlines will appear here when scheduled."
        action={
          <Link
            href="/app/applications?activeOnly=true&includeArchived=false&sort=newest"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Review applications
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {nextInterview ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="type-mono-label text-muted-foreground">
                  Next Interview
                </p>
                <p className="mt-1 font-medium leading-tight">
                  {nextInterview.interviewType}
                </p>
                <p className="type-small mt-0.5 text-muted-foreground">
                  {nextInterview.applicationTitle}
                </p>
                <p className="type-small text-muted-foreground">
                  {nextInterview.companyName}
                </p>
                <p className="type-mono-label mt-2 text-foreground">
                  {formatDate(nextInterview.scheduledAt)} at{" "}
                  {formatTime(nextInterview.scheduledAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="type-mono-label text-muted-foreground">
                  Next Interview
                </p>
                <p className="mt-2 type-small text-muted-foreground">
                  No interviews scheduled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {nearestDeadline ? (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="type-mono-label text-muted-foreground">
                  Nearest Deadline
                </p>
                <p className="mt-1 font-medium leading-tight">
                  {nearestDeadline.title}
                </p>
                <p className="type-small mt-0.5 text-muted-foreground">
                  {nearestDeadline.companyName}
                </p>
                <p className="type-mono-label mt-2 text-foreground">
                  {formatDate(nearestDeadline.deadline)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="type-mono-label text-muted-foreground">
                  Nearest Deadline
                </p>
                <p className="mt-2 type-small text-muted-foreground">
                  No upcoming deadlines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
