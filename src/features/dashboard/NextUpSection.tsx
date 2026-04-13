"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import {
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";
import { formatShortDate, formatTime } from "@/lib/ui/formatRelativeTime";
import { getInterviewTypeLabel } from "@/features/interviews/interviewLabels";

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


export function NextUpSection({
  nextInterview,
  nearestDeadline,
}: NextUpSectionProps) {
  const shouldReduceMotion = useReducedMotion();

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
    <motion.div
      className="flex h-full flex-col gap-6 sm:flex-row sm:items-stretch"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="min-w-0 sm:flex-1"
        variants={staggerItem}
        transition={
          shouldReduceMotion ? reducedMotionTransition : staggerItemTransition
        }
      >
        {nextInterview ? (
          <Card size="sm" className="card-hover-lift h-full">
            <CardHeader>
              <CardTitle className="type-section-label text-muted-foreground">
                Next Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">
                    {getInterviewTypeLabel(nextInterview.interviewType)}
                  </p>
                  <p className="type-small mt-1 text-muted-foreground">
                    {nextInterview.applicationTitle}
                  </p>
                  <p className="type-small text-muted-foreground">
                    {nextInterview.companyName}
                  </p>
                </div>
              </div>
              <p className="type-mono-label mt-auto pt-3 text-foreground">
                {formatShortDate(nextInterview.scheduledAt)} at{" "}
                {formatTime(nextInterview.scheduledAt)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card size="sm" className="card-hover-lift h-full">
            <CardHeader>
              <CardTitle className="type-section-label text-muted-foreground">
                Next Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="type-small text-muted-foreground">
                No interviews scheduled.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      <motion.div
        className="min-w-0 sm:flex-1"
        variants={staggerItem}
        transition={
          shouldReduceMotion ? reducedMotionTransition : staggerItemTransition
        }
      >
        {nearestDeadline ? (
          <Card size="sm" className="card-hover-lift h-full">
            <CardHeader>
              <CardTitle className="type-section-label text-muted-foreground">
                Nearest Deadline
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-tight">
                    {nearestDeadline.title}
                  </p>
                  <p className="type-small mt-1 text-muted-foreground">
                    {nearestDeadline.companyName}
                  </p>
                </div>
              </div>
              <p className="type-mono-label mt-auto pt-3 text-foreground">
                {formatShortDate(nearestDeadline.deadline)}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card size="sm" className="card-hover-lift h-full">
            <CardHeader>
              <CardTitle className="type-section-label text-muted-foreground">
                Nearest Deadline
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="type-small text-muted-foreground">
                No upcoming deadlines.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </motion.div>
  );
}
