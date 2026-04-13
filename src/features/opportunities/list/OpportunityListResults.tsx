"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { RowActions } from "@/components/shared/RowActions";
import { StageBadge } from "@/components/ui/stage-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import {
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";
import { formatShortDate } from "@/lib/ui/formatRelativeTime";
import { Compass } from "lucide-react";
import { OpportunityCreateModal } from "../OpportunityCreateModal";
import type { OpportunityRow } from "./types";

export function OpportunityListResults({
  opportunities,
  filtered,
  isFiltered,
  onClearFilters,
}: {
  opportunities: OpportunityRow[];
  filtered: OpportunityRow[];
  isFiltered: boolean;
  onClearFilters: () => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {filtered.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={isFiltered ? "No matching opportunities" : "No opportunities yet"}
          description={
            isFiltered
              ? "Try adjusting your filters."
              : "Add your first opportunity to start tracking roles in one place."
          }
          actionLabel={isFiltered ? "Clear filters" : undefined}
          onAction={isFiltered ? onClearFilters : undefined}
          action={isFiltered ? undefined : <OpportunityCreateModal />}
        />
      ) : (
        <>
          <p className="mb-1 type-caption text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            of {opportunities.length} opportunities
          </p>
          <motion.div
            className="divide-y divide-border rounded-xl border border-border shadow-sm"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filtered.map((opp) => (
              <motion.div
                key={opp.id}
                variants={staggerItem}
                transition={
                  shouldReduceMotion
                    ? reducedMotionTransition
                    : staggerItemTransition
                }
              >
                <OpportunityListRow opp={opp} />
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </>
  );
}

function OpportunityListRow({ opp }: { opp: OpportunityRow }) {
  const router = useRouter();
  const displayDate = opp.deadline ?? opp.createdAt;
  const remoteModeLabel =
    opp.remoteMode === "Remote"
      ? "Remote"
      : opp.remoteMode === "Hybrid"
        ? "Hybrid"
        : null;

  return (
    <div className="group/row flex items-center gap-4 px-4 py-3 transition-colors duration-100 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
      <div className="min-w-0 flex-1">
        <Link
          href={`/app/opportunities/${opp.id}`}
          className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block"
        >
          {opp.title}
        </Link>
        <div className="mt-0.5 flex items-center gap-1.5 truncate">
          <Link
            href={`/app/companies/${opp.company.id}`}
            className="type-small text-muted-foreground hover:text-foreground transition-colors truncate"
          >
            {opp.company.name}
          </Link>
          {opp.location && (
            <span className="type-small text-muted-foreground truncate">· {opp.location}</span>
          )}
        </div>
        <div className="mt-1 grid grid-flow-col auto-cols-max items-center gap-2 md:grid-flow-row md:grid-cols-[13ch_18ch_9ch]">
          <StageBadge
            stage={opp.stage}
            className="md:w-full md:justify-center"
          />
          <TypeBadge
            type={opp.opportunityType}
            className="md:w-full md:justify-center"
          />
          {remoteModeLabel ? (
            <Badge
              variant="outline"
              className="md:w-full md:justify-center"
            >
              {remoteModeLabel}
            </Badge>
          ) : (
            <span
              aria-hidden="true"
              className="hidden md:block md:w-full"
            />
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {displayDate && (
          <span className="type-caption text-muted-foreground tabular-nums">
            {formatShortDate(displayDate, { includeYear: true })}
          </span>
        )}
        <RowActions
          onEdit={() => router.push(`/app/opportunities/${opp.id}`)}
          label="Opportunity actions"
        />
      </div>
    </div>
  );
}
