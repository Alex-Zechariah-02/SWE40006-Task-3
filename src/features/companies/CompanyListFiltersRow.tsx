"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { FilterBar } from "@/components/shared/FilterBar";
import { cn } from "@/lib/utils";

export type CompanySortKey = "name" | "applications" | "opportunities";

export function CompanyListFiltersRow({
  industryFilter,
  onIndustryFilterChange,
  sort,
  onSortChange,
  uniqueIndustries,
}: {
  industryFilter: string;
  onIndustryFilterChange: (value: string) => void;
  sort: CompanySortKey;
  onSortChange: (value: CompanySortKey) => void;
  uniqueIndustries: string[];
}) {
  const activeFilters: Array<{ key: string; label: string }> = [];
  if (industryFilter !== "all") {
    activeFilters.push({
      key: "industry",
      label: `Industry: ${industryFilter}`,
    });
  }

  return (
    <FilterBar
      activeFilters={activeFilters}
      onRemoveFilter={() => onIndustryFilterChange("all")}
      onClearAll={() => onIndustryFilterChange("all")}
    >
      {uniqueIndustries.length > 0 && (
        <Select
          value={industryFilter}
          onValueChange={(v) => onIndustryFilterChange(v ?? "all")}
        >
          <SelectTrigger className="w-auto" aria-label="Filter by industry">
            <span
              data-slot="select-value"
              className={cn(industryFilter !== "all" && "text-primary")}
            >
              {industryFilter === "all"
                ? "Industry"
                : `Industry: ${industryFilter}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {uniqueIndustries.map((ind) => (
              <SelectItem key={ind} value={ind}>
                {ind}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <div className="ml-auto">
        <Select
          value={sort}
          onValueChange={(v) => onSortChange((v ?? "name") as CompanySortKey)}
        >
          <SelectTrigger className="w-auto" aria-label="Sort companies">
            <span data-slot="select-value">
              {sort === "name"
                ? "Name A–Z"
                : sort === "applications"
                  ? "Most applications"
                  : "Most opportunities"}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A–Z</SelectItem>
            <SelectItem value="applications">Most applications</SelectItem>
            <SelectItem value="opportunities">Most opportunities</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FilterBar>
  );
}
