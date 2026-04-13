"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/shared/FilterBar";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { cn } from "@/lib/utils";
import { formatTagLabel } from "@/lib/ui/formatTagLabel";
import { Search, X } from "lucide-react";
import { APPLICATION_STAGE_LABELS } from "../applicationLabels";
import type { FilterKey, SortKey } from "./types";
import { OPPORTUNITY_TYPES, OPPORTUNITY_TYPE_LABELS } from "./types";

const VISIBILITY_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "all", label: "All" },
  { value: "archived", label: "Archived" },
];

const SORT_ITEMS = [
  { value: "newest", label: "Newest" },
  { value: "deadline", label: "Nearest deadline" },
  { value: "urgent", label: "Most urgent" },
  { value: "company", label: "Company A-Z" },
];

export function ApplicationListFiltersRow({
  filters,
  onFilterChange,
  sort,
  onSortChange,
  uniqueCompanies,
  allTags,
}: {
  filters: Record<FilterKey, string>;
  onFilterChange: (key: FilterKey, value: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  uniqueCompanies: Array<{ id: string; name: string }>;
  allTags: string[];
}) {
  const visibilityValue =
    filters.includeArchived === "true"
      ? "archived"
      : filters.activeOnly === "true"
        ? "active"
        : "all";
  const [localSearch, setLocalSearch] = React.useState(filters.search);

  React.useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFilterChange("search", localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search, onFilterChange]);

  function handleVisibilityChange(value: string) {
    switch (value) {
      case "active":
        onFilterChange("activeOnly", "true");
        onFilterChange("includeArchived", "false");
        break;
      case "all":
        onFilterChange("activeOnly", "false");
        onFilterChange("includeArchived", "false");
        break;
      case "archived":
        onFilterChange("activeOnly", "false");
        onFilterChange("includeArchived", "true");
        break;
    }
  }

  const activeFilters: Array<{ key: string; label: string }> = [];
  if (filters.stage !== "all") {
    activeFilters.push({
      key: "stage",
      label: `Stage: ${APPLICATION_STAGE_LABELS[filters.stage] ?? filters.stage}`,
    });
  }
  if (filters.company !== "all") {
    const name = uniqueCompanies.find((c) => c.id === filters.company)?.name;
    activeFilters.push({ key: "company", label: `Company: ${name ?? filters.company}` });
  }
  if (filters.opportunityType !== "all") {
    activeFilters.push({
      key: "opportunityType",
      label: `Type: ${OPPORTUNITY_TYPE_LABELS[filters.opportunityType] ?? filters.opportunityType}`,
    });
  }
  if (filters.priority !== "all") {
    activeFilters.push({ key: "priority", label: `Priority: ${filters.priority}` });
  }
  if (filters.tag !== "all") {
    activeFilters.push({ key: "tag", label: `Tag: ${formatTagLabel(filters.tag)}` });
  }
  if (visibilityValue !== "active") {
    const label = VISIBILITY_OPTIONS.find((o) => o.value === visibilityValue)?.label ?? visibilityValue;
    activeFilters.push({ key: "visibility", label: `View: ${label}` });
  }
  if (filters.search) {
    activeFilters.push({ key: "search", label: `Search: ${filters.search}` });
  }

  function handleRemoveFilter(key: string) {
    if (key === "visibility") {
      onFilterChange("activeOnly", "true");
      onFilterChange("includeArchived", "false");
    } else if (key === "search") {
      onFilterChange("search", "");
    } else {
      onFilterChange(key as FilterKey, "all");
    }
  }

  function handleClearAll() {
    onFilterChange("stage", "all");
    onFilterChange("company", "all");
    onFilterChange("opportunityType", "all");
    onFilterChange("priority", "all");
    onFilterChange("tag", "all");
    onFilterChange("activeOnly", "true");
    onFilterChange("includeArchived", "false");
    onFilterChange("search", "");
  }

  return (
    <FilterBar
      activeFilters={activeFilters}
      onRemoveFilter={handleRemoveFilter}
      onClearAll={handleClearAll}
    >
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Search applications…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-8 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          aria-label="Search applications"
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear application search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <Select
        value={filters.stage}
        onValueChange={(v) => onFilterChange("stage", v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by stage">
          <span
            data-slot="select-value"
            className={cn(filters.stage !== "all" && "text-primary")}
          >
            {filters.stage === "all"
              ? "Stage"
              : `Stage: ${APPLICATION_STAGE_LABELS[filters.stage] ?? filters.stage}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stages</SelectItem>
          {Object.keys(APPLICATION_STAGE_LABELS).map((s) => (
            <SelectItem key={s} value={s}>
              {APPLICATION_STAGE_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {uniqueCompanies.length > 0 && (
        <Select
          value={filters.company}
          onValueChange={(v) => onFilterChange("company", v ?? "all")}
        >
          <SelectTrigger className="w-auto" aria-label="Filter by company">
            <span
              data-slot="select-value"
              className={cn(filters.company !== "all" && "text-primary")}
            >
              {filters.company === "all"
                ? "Company"
                : `Company: ${uniqueCompanies.find((c) => c.id === filters.company)?.name ?? filters.company}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {uniqueCompanies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select
        value={filters.opportunityType}
        onValueChange={(v) => onFilterChange("opportunityType", v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by opportunity type">
          <span
            data-slot="select-value"
            className={cn(filters.opportunityType !== "all" && "text-primary")}
          >
            {filters.opportunityType === "all"
              ? "Type"
              : `Type: ${OPPORTUNITY_TYPE_LABELS[filters.opportunityType] ?? filters.opportunityType}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          {OPPORTUNITY_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {OPPORTUNITY_TYPE_LABELS[t]}
            </SelectItem>
          ))}
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

      {allTags.length > 0 && (
        <Select
          value={filters.tag}
          onValueChange={(v) => onFilterChange("tag", v ?? "all")}
        >
          <SelectTrigger className="w-auto" aria-label="Filter by tag">
            <span
              data-slot="select-value"
              className={cn(filters.tag !== "all" && "text-primary")}
            >
              {filters.tag === "all" ? "Tag" : `Tag: ${formatTagLabel(filters.tag)}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {allTags.map((t) => (
              <SelectItem key={t} value={t}>
                {formatTagLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <SegmentedControl
        value={visibilityValue}
        onValueChange={handleVisibilityChange}
        options={VISIBILITY_OPTIONS}
      />

      <div className="ml-auto">
        <Select
          value={sort}
          onValueChange={(v) => onSortChange((v ?? "newest") as SortKey)}
          items={SORT_ITEMS}
        >
          <SelectTrigger className="w-auto" aria-label="Sort applications">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="deadline">Nearest deadline</SelectItem>
            <SelectItem value="urgent">Most urgent</SelectItem>
            <SelectItem value="company">Company A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>
  );
}
