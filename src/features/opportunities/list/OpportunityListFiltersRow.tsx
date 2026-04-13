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
import { cn } from "@/lib/utils";
import { formatTagLabel } from "@/lib/ui/formatTagLabel";
import { Search } from "lucide-react";
import type { FilterKey, SortKey } from "./types";

const OPPORTUNITY_TYPE_DISPLAY: Record<string, string> = {
  Internship: "Internship",
  GraduateProgram: "Graduate program",
  FullTime: "Full-time",
  PartTime: "Part-time",
  Contract: "Contract",
};

const SORT_ITEMS = [
  { value: "newest", label: "Newest saved" },
  { value: "deadline", label: "Nearest deadline" },
  { value: "company", label: "Company A-Z" },
];

export function OpportunityListFiltersRow({
  filters,
  onFilterChange,
  sort,
  onSortChange,
  sourceTypes,
  uniqueCompanies,
  allTags,
}: {
  filters: Record<FilterKey, string>;
  onFilterChange: (key: FilterKey, value: string) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  sourceTypes: string[];
  uniqueCompanies: Array<{ id: string; name: string }>;
  allTags: string[];
}) {
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

  const activeFilters: Array<{ key: string; label: string }> = [];
  if (filters.stage !== "all") {
    activeFilters.push({ key: "stage", label: `Stage: ${filters.stage}` });
  }
  if (filters.sourceType !== "all") {
    activeFilters.push({ key: "sourceType", label: `Source: ${filters.sourceType}` });
  }
  if (filters.opportunityType !== "all") {
    activeFilters.push({
      key: "opportunityType",
      label: `Type: ${OPPORTUNITY_TYPE_DISPLAY[filters.opportunityType] ?? filters.opportunityType}`,
    });
  }
  if (filters.company !== "all") {
    const name = uniqueCompanies.find((c) => c.id === filters.company)?.name;
    activeFilters.push({ key: "company", label: `Company: ${name ?? filters.company}` });
  }
  if (filters.tag !== "all") {
    activeFilters.push({ key: "tag", label: `Tag: ${formatTagLabel(filters.tag)}` });
  }
  if (filters.search) {
    activeFilters.push({ key: "search", label: `Search: ${filters.search}` });
  }

  function handleRemoveFilter(key: string) {
    if (key === "search") {
      onFilterChange("search", "");
    } else {
      onFilterChange(key as FilterKey, "all");
    }
  }

  function handleClearAll() {
    onFilterChange("stage", "all");
    onFilterChange("sourceType", "all");
    onFilterChange("opportunityType", "all");
    onFilterChange("company", "all");
    onFilterChange("tag", "all");
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
          placeholder="Search opportunities…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="h-8 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          aria-label="Search opportunities"
        />
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
              : `Stage: ${filters.stage}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All stages</SelectItem>
          <SelectItem value="Saved">Saved</SelectItem>
          <SelectItem value="Shortlisted">Shortlisted</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.sourceType}
        onValueChange={(v) => onFilterChange("sourceType", v ?? "all")}
      >
        <SelectTrigger className="w-auto" aria-label="Filter by source">
          <span
            data-slot="select-value"
            className={cn(filters.sourceType !== "all" && "text-primary")}
          >
            {filters.sourceType === "all"
              ? "Source"
              : `Source: ${filters.sourceType}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {sourceTypes.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
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
              : `Type: ${OPPORTUNITY_TYPE_DISPLAY[filters.opportunityType] ?? filters.opportunityType}`}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All types</SelectItem>
          <SelectItem value="Internship">Internship</SelectItem>
          <SelectItem value="GraduateProgram">Graduate program</SelectItem>
          <SelectItem value="FullTime">Full-time</SelectItem>
          <SelectItem value="PartTime">Part-time</SelectItem>
          <SelectItem value="Contract">Contract</SelectItem>
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

      <div className="ml-auto">
        <Select
          value={sort}
          onValueChange={(v) => onSortChange((v ?? "newest") as SortKey)}
          items={SORT_ITEMS}
        >
          <SelectTrigger className="w-auto" aria-label="Sort opportunities">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest saved</SelectItem>
            <SelectItem value="deadline">Nearest deadline</SelectItem>
            <SelectItem value="company">Company A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>
  );
}
