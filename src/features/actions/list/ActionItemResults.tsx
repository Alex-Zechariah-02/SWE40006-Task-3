"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  defaultTransition,
  fadeVariants,
  reducedMotionTransition,
  staggerContainer,
  staggerItem,
  staggerItemTransition,
} from "@/lib/ui/animations";
import { CheckCircle2 } from "lucide-react";
import { ActionItemCard } from "../ActionItemCard";
import type { ActionItemRow, ViewMode } from "./types";
import { ActionItemRowItem } from "./ActionItemRowItem";

export function ActionItemResults({
  actionItems,
  filtered,
  viewMode,
  deletePendingId,
  onCreate,
  isFiltered,
  onClearFilters,
  onEdit,
  onDelete,
}: {
  actionItems: ActionItemRow[];
  filtered: ActionItemRow[];
  viewMode: ViewMode;
  deletePendingId: string | null;
  onCreate: () => void;
  isFiltered: boolean;
  onClearFilters: () => void;
  onEdit: (item: ActionItemRow) => void;
  onDelete: (item: ActionItemRow) => void;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <>
      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title={isFiltered ? "No matching action items" : "No action items yet"}
          description={
            isFiltered
              ? "Try adjusting your filters."
              : "Create one to track your next steps."
          }
          actionLabel={isFiltered ? "Clear filters" : "New action item"}
          onAction={isFiltered ? onClearFilters : onCreate}
        />
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {viewMode === "cards" ? (
            <motion.div
              key="cards"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={
                shouldReduceMotion
                  ? reducedMotionTransition
                  : defaultTransition
              }
            >
              <motion.div
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={staggerItem}
                    transition={
                      shouldReduceMotion
                        ? reducedMotionTransition
                        : staggerItemTransition
                    }
                  >
                    <ActionItemCard
                      item={item}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      isDeleting={deletePendingId === item.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              variants={fadeVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={
                shouldReduceMotion
                  ? reducedMotionTransition
                  : defaultTransition
              }
            >
              <motion.div
                className="divide-y divide-border rounded-xl border border-border shadow-sm overflow-clip"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {filtered.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={staggerItem}
                    transition={
                      shouldReduceMotion
                        ? reducedMotionTransition
                        : staggerItemTransition
                    }
                  >
                    <ActionItemRowItem
                      item={item}
                      onEdit={() => onEdit(item)}
                      onDelete={() => onDelete(item)}
                      isDeleting={deletePendingId === item.id}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <p className="mt-3 type-small text-muted-foreground">
        <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
        {actionItems.length} action items
      </p>
    </>
  );
}
