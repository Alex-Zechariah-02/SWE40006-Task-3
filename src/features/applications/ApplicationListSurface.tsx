"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import type { FilterKey, SortKey } from "./list/types";
import type { ApplicationListSurfaceProps } from "./list/types";
import { ApplicationListFiltersRow } from "./list/ApplicationListFiltersRow";
import { ApplicationListResults } from "./list/ApplicationListResults";
import {
  applySearchParamsToApplicationListFilters,
  deriveApplicationListOptions,
  filterAndSortApplications,
  parseApplicationListSort,
} from "./list/logic";

const DEFAULT_APPLICATION_FILTERS: Record<FilterKey, string> = {
  stage: "all",
  company: "all",
  opportunityType: "all",
  priority: "all",
  tag: "all",
  activeOnly: "true",
  includeArchived: "false",
  search: "",
};

export function ApplicationListSurface({
  applications,
}: ApplicationListSurfaceProps) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    ...DEFAULT_APPLICATION_FILTERS,
  });
  const [sort, setSort] = React.useState<SortKey>("newest");

  function setFilter(key: FilterKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  React.useEffect(() => {
    setFilters((prev) =>
      applySearchParamsToApplicationListFilters({
        searchParams,
        prevFilters: prev,
      })
    );
    setSort((prev) => parseApplicationListSort({ searchParams, prevSort: prev }));
  }, [searchParams]);

  const filtered = React.useMemo(
    () => filterAndSortApplications({ applications, filters, sort }),
    [applications, filters, sort]
  );

  const { allTags, uniqueCompanies } = React.useMemo(
    () => deriveApplicationListOptions(applications),
    [applications]
  );
  const isFiltered = (Object.keys(DEFAULT_APPLICATION_FILTERS) as FilterKey[]).some(
    (key) => filters[key] !== DEFAULT_APPLICATION_FILTERS[key]
  );

  function handleClearFilters() {
    setFilters({ ...DEFAULT_APPLICATION_FILTERS });
  }

  return (
    <div>
      <ApplicationListFiltersRow
        filters={filters}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        uniqueCompanies={uniqueCompanies}
        allTags={allTags}
      />

      <ApplicationListResults
        applications={applications}
        filtered={filtered}
        isFiltered={isFiltered}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
