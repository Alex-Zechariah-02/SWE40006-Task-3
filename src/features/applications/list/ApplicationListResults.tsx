"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { RowActions } from "@/components/shared/RowActions";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { StageBadge } from "@/components/ui/stage-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import {
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";
import { formatShortDate } from "@/lib/ui/formatRelativeTime";
import { FileText } from "lucide-react";
import type { ApplicationRow } from "./types";

export function ApplicationListResults({
  applications,
  filtered,
  isFiltered,
  onClearFilters,
}: {
  applications: ApplicationRow[];
  filtered: ApplicationRow[];
  isFiltered: boolean;
  onClearFilters: () => void;
}) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={isFiltered ? "No matching applications" : "No applications yet"}
          description={
            isFiltered
              ? "Try adjusting your filters."
              : "Start by adding your first job application to track its progress."
          }
          actionLabel={isFiltered ? "Clear filters" : "Browse opportunities"}
          onAction={
            isFiltered ? onClearFilters : () => router.push("/app/opportunities")
          }
        />
      ) : (
        <>
          <p className="mb-1 type-caption text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            of {applications.length} applications
          </p>
          <motion.div
            className="divide-y divide-border overflow-clip rounded-xl border border-border shadow-sm"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filtered.map((app) => (
              <motion.div
                key={app.id}
                variants={staggerItem}
                transition={
                  shouldReduceMotion
                    ? reducedMotionTransition
                    : staggerItemTransition
                }
              >
                <ApplicationListRow app={app} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </>
  );
}

function ApplicationListRow({ app }: { app: ApplicationRow }) {
  const router = useRouter();
  const displayDate = app.appliedDate ?? app.createdAt;

  return (
    <div className="group/row interactive-row grid grid-cols-1 gap-2 px-4 py-3 transition-colors duration-100 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-4">
      <div className="min-w-0 flex-1">
        <Link
          href={`/app/applications/${app.id}`}
          className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block"
        >
          {app.opportunity.title}
        </Link>
        <Link
          href={`/app/companies/${app.company.id}`}
          className="mt-0.5 type-small text-muted-foreground hover:text-foreground transition-colors block truncate"
        >
          {app.company.name}
        </Link>
      </div>

      <div className="grid shrink-0 grid-flow-col auto-cols-max items-center gap-2 md:grid-flow-row md:grid-cols-[18ch_13ch_9ch] md:justify-end">
        <TypeBadge
          type={app.opportunity.opportunityType}
          className="md:w-full md:justify-center"
        />
        <StageBadge
          stage={app.currentStage}
          className="md:w-full md:justify-center"
        />
        <PriorityBadge
          priority={app.priority}
          className="md:w-full md:justify-center"
        />
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        {displayDate && (
          <span className="type-caption text-muted-foreground tabular-nums">
            {formatShortDate(displayDate, { includeYear: true })}
          </span>
        )}
        {app.archivedAt && (
          <span className="type-caption italic text-muted-foreground">
            Archived
          </span>
        )}
        <RowActions
          onEdit={() => router.push(`/app/applications/${app.id}`)}
          label="Application actions"
        />
      </div>
    </div>
  );
}
