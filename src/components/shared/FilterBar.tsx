"use client";

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  defaultTransition,
  reducedMotionTransition,
  scaleVariants,
} from "@/lib/ui/animations";
import { FilterChip } from "./FilterChip";

interface ActiveFilter {
  key: string;
  label: string;
}

interface FilterBarProps {
  children: React.ReactNode;
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (key: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterBar({
  children,
  activeFilters = [],
  onRemoveFilter,
  onClearAll,
  className,
}: FilterBarProps) {
  const shouldReduceMotion = useReducedMotion();
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className={cn("space-y-2 pb-4", className)}>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="type-caption text-muted-foreground mr-1">
            Filters:
          </span>
          <AnimatePresence initial={false} mode="popLayout">
            {activeFilters.map((filter) => (
              <motion.div
                key={filter.key}
                variants={scaleVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={
                  shouldReduceMotion
                    ? reducedMotionTransition
                    : defaultTransition
                }
              >
                <FilterChip
                  label={filter.label}
                  onRemove={() => onRemoveFilter?.(filter.key)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          {activeFilters.length > 1 && onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="type-caption text-muted-foreground hover:text-foreground ml-1 transition-colors duration-150"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
