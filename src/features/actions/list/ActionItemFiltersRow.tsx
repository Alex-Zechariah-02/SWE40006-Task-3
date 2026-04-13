"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/shared/FilterBar";
import { cn } from "@/lib/utils";
import { LayoutGrid, List } from "lucide-react";
import type { EntityOption } from "../types";
import type { FilterKey, SortKey, ViewMode } from "./types";

const STATUS_OPTIONS: Record<string, string> = {
  openWork: "Open",
  completedWork: "Done",
  Cancelled: "Cancelled",
};

const LINKED_TYPE_DISPLAY: Record<string, string> = {
  none: "Unlinked",
  company: "Company",
  opportunity: "Opportunity",
  application: "Application",
  interview: "Interview",
};

const DUE_WINDOW_DISPLAY: Record<string, string> = {
  overdue: "Overdue",
  dueSoon: "Due soon",
  noDue: "No due date",
};

const SORT_ITEMS = [
  { value: "newest", label: "Newest" },
  { value: "dueDate", label: "Nearest due date" },
  { value: "priority", label: "Priority" },
];

export function ActionItemFiltersRow({
  filters,
  onFilterChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  companyOptions,
  opportunityOptions,
}: {
  filters: Record<FilterKey, string>;
  onFilterChange: (key: FilterKey, value: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  companyOptions: EntityOption[];
  opportunityOptions: EntityOption[];
}) {
  const activeFilters: Array<{ key: string; label: string }> = [];
  if (filters.status !== "all") {
    const label = STATUS_OPTIONS[filters.status] ?? filters.status;
    activeFilters.push({ key: "status", label: `Status: ${label}` });
  }
  if (filters.priority !== "all") {
    activeFilters.push({ key: "priority", label: `Priority: ${filters.priority}` });
  }
  if (filters.linkedType !== "all") {
    activeFilters.push({
      key: "linkedType",
      label: `Link: ${LINKED_TYPE_DISPLAY[filters.linkedType] ?? filters.linkedType}`,
    });
  }
  if (filters.dueWindow !== "all") {
    activeFilters.push({
      key: "dueWindow",
      label: `Due: ${DUE_WINDOW_DISPLAY[filters.dueWindow] ?? filters.dueWindow}`,
    });
  }
  if (filters.companyId !== "all") {
    const name = companyOptions.find((c) => c.id === filters.companyId)?.label;
    activeFilters.push({ key: "companyId", label: `Company: ${name ?? filters.companyId}` });
  }
  if (filters.opportunityId !== "all") {
    const name = opportunityOptions.find((o) => o.id === filters.opportunityId)?.label;
    activeFilters.push({
      key: "opportunityId",
      label: `Opportunity: ${name ?? filters.opportunityId}`,
    });
  }

  function handleRemoveFilter(key: string) {
    onFilterChange(key as FilterKey, "all");
  }

  function handleClearAll() {
    onFilterChange("status", "all");
    onFilterChange("priority", "all");
    onFilterChange("linkedType", "all");
    onFilterChange("dueWindow", "all");
    onFilterChange("companyId", "all");
    onFilterChange("opportunityId", "all");
  }

  return (
    <FilterBar
      activeFilters={activeFilters}
      onRemoveFilter={handleRemoveFilter}
      onClearAll={handleClearAll}
    >
      <Select
        value={filters.status}
        onValueChange={(v) => onFilterChange("status", v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by status">
          <span
            data-slot="select-value"
            className={cn(filters.status !== "all" && "text-primary")}
          >
            {filters.status === "all"
              ? "Status"
              : `Status: ${STATUS_OPTIONS[filters.status] ?? filters.status}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="openWork">Open</SelectItem>
          <SelectItem value="completedWork">Done</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.priority}
        onValueChange={(v) => onFilterChange("priority", v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by priority">
          <span
            data-slot="select-value"
            className={cn(filters.priority !== "all" && "text-primary")}
          >
            {filters.priority === "all"
              ? "Priority"
              : `Priority: ${filters.priority}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priorities</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.linkedType}
        onValueChange={(v) => onFilterChange("linkedType", v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by link type">
          <span
            data-slot="select-value"
            className={cn(filters.linkedType !== "all" && "text-primary")}
          >
            {filters.linkedType === "all"
              ? "Link type"
              : `Link: ${LINKED_TYPE_DISPLAY[filters.linkedType] ?? filters.linkedType}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All link types</SelectItem>
          <SelectItem value="none">Unlinked</SelectItem>
          <SelectItem value="company">Company</SelectItem>
          <SelectItem value="opportunity">Opportunity</SelectItem>
          <SelectItem value="application">Application</SelectItem>
          <SelectItem value="interview">Interview</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.dueWindow}
        onValueChange={(v) => onFilterChange("dueWindow", v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by due date">
          <span
            data-slot="select-value"
            className={cn(filters.dueWindow !== "all" && "text-primary")}
          >
            {filters.dueWindow === "all"
              ? "Due date"
              : `Due: ${DUE_WINDOW_DISPLAY[filters.dueWindow] ?? filters.dueWindow}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All due dates</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="dueSoon">Due soon (within 3 days)</SelectItem>
          <SelectItem value="noDue">No due date</SelectItem>
        </SelectContent>
      </Select>

      {companyOptions.length > 0 && (
        <Select
          value={filters.companyId}
          onValueChange={(v) => onFilterChange("companyId", v ?? "all")}
        >
          <SelectTrigger className="w-auto" aria-label="Filter by company">
            <span
              data-slot="select-value"
              className={cn(filters.companyId !== "all" && "text-primary")}
            >
              {filters.companyId === "all"
                ? "Company"
                : `Company: ${companyOptions.find((c) => c.id === filters.companyId)?.label ?? filters.companyId}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {companyOptions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {opportunityOptions.length > 0 && (
        <Select
          value={filters.opportunityId}
          onValueChange={(v) => onFilterChange("opportunityId", v ?? "all")}
        >
          <SelectTrigger className="w-auto" aria-label="Filter by opportunity">
            <span
              data-slot="select-value"
              className={cn(filters.opportunityId !== "all" && "text-primary")}
            >
              {filters.opportunityId === "all"
                ? "Opportunity"
                : `Opportunity: ${opportunityOptions.find((o) => o.id === filters.opportunityId)?.label ?? filters.opportunityId}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All opportunities</SelectItem>
            {opportunityOptions.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="size-8 btn-press"
            onClick={() => onViewModeChange("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            title="List view"
          >
            <List className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="icon"
            className="size-8 btn-press"
            onClick={() => onViewModeChange("cards")}
            aria-label="Cards view"
            aria-pressed={viewMode === "cards"}
            title="Cards view"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
        </div>
        <Select
          value={sort}
          onValueChange={(v) => onSortChange((v ?? "newest") as SortKey)}
          items={SORT_ITEMS}
        >
          <SelectTrigger className="w-auto" aria-label="Sort action items">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="dueDate">Nearest due date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>
  );
}
