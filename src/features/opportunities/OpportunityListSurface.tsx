"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import type { FilterKey, OpportunityListSurfaceProps, SortKey } from "./list/types";
import { OpportunityListFiltersRow } from "./list/OpportunityListFiltersRow";
import { OpportunityListResults } from "./list/OpportunityListResults";
import {
  applySearchParamsToOpportunityListFilters,
  deriveOpportunityListOptions,
  filterAndSortOpportunities,
  parseOpportunityListDeadlineWindow,
  parseOpportunityListSort,
} from "./list/logic";

const DEFAULT_OPPORTUNITY_FILTERS: Record<FilterKey, string> = {
  stage: "all",
  sourceType: "all",
  opportunityType: "all",
  company: "all",
  tag: "all",
  search: "",
};

export function OpportunityListSurface({
  opportunities,
}: OpportunityListSurfaceProps) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    ...DEFAULT_OPPORTUNITY_FILTERS,
  });
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [deadlineWindow, setDeadlineWindow] = React.useState<string>("all");

  function setFilter(key: FilterKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  React.useEffect(() => {
    setFilters((prev) =>
      applySearchParamsToOpportunityListFilters({ searchParams, prevFilters: prev })
    );
    setSort((prev) => parseOpportunityListSort({ searchParams, prevSort: prev }));
    setDeadlineWindow((prev) =>
      parseOpportunityListDeadlineWindow({
        searchParams,
        prevDeadlineWindow: prev,
      })
    );
  }, [searchParams]);

  const filtered = React.useMemo(
    () => filterAndSortOpportunities({ opportunities, filters, sort, deadlineWindow }),
    [opportunities, filters, sort, deadlineWindow]
  );

  const { sourceTypes, uniqueCompanies, allTags } = React.useMemo(
    () => deriveOpportunityListOptions({ opportunities }),
    [opportunities]
  );
  const isFiltered = (Object.keys(DEFAULT_OPPORTUNITY_FILTERS) as FilterKey[]).some(
    (key) => filters[key] !== DEFAULT_OPPORTUNITY_FILTERS[key]
  ) || deadlineWindow !== "all";

  function handleClearFilters() {
    setFilters({ ...DEFAULT_OPPORTUNITY_FILTERS });
    setDeadlineWindow("all");
  }

  return (
    <div>
      <OpportunityListFiltersRow
        filters={filters}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        sourceTypes={sourceTypes}
        uniqueCompanies={uniqueCompanies}
        allTags={allTags}
      />

      <OpportunityListResults
        opportunities={opportunities}
        filtered={filtered}
        isFiltered={isFiltered}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
}
