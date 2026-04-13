import type { FilterKey, OpportunityRow, SortKey } from "./types";

type SearchParamsLike = {
  get(name: string): string | null;
};

export function applySearchParamsToOpportunityListFilters(params: {
  searchParams: SearchParamsLike;
  prevFilters: Record<FilterKey, string>;
}): Record<FilterKey, string> {
  const stage = params.searchParams.get("stage");
  const sourceType = params.searchParams.get("sourceType");
  const opportunityType = params.searchParams.get("opportunityType");
  const company = params.searchParams.get("company");
  const tag = params.searchParams.get("tag");
  const search = params.searchParams.get("search");

  return {
    ...params.prevFilters,
    stage: stage ?? params.prevFilters.stage,
    sourceType: sourceType ?? params.prevFilters.sourceType,
    opportunityType: opportunityType ?? params.prevFilters.opportunityType,
    company: company ?? params.prevFilters.company,
    tag: tag ?? params.prevFilters.tag,
    search: search ?? params.prevFilters.search,
  };
}

export function parseOpportunityListSort(params: {
  searchParams: SearchParamsLike;
  prevSort: SortKey;
}): SortKey {
  const sortParam = params.searchParams.get("sort");
  if (sortParam === "newest" || sortParam === "deadline" || sortParam === "company") {
    return sortParam as SortKey;
  }

  return params.prevSort;
}

export function parseOpportunityListDeadlineWindow(params: {
  searchParams: SearchParamsLike;
  prevDeadlineWindow: string;
}): string {
  const deadlineWindowParam = params.searchParams.get("deadlineWindow");
  return deadlineWindowParam ?? params.prevDeadlineWindow;
}

export function filterAndSortOpportunities(params: {
  opportunities: OpportunityRow[];
  filters: Record<FilterKey, string>;
  sort: SortKey;
  deadlineWindow: string;
}): OpportunityRow[] {
  let result = params.opportunities;

  if (params.deadlineWindow === "near") {
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const twentyOneDaysFromToday = new Date(
      startToday.getTime() + 21 * 24 * 60 * 60 * 1000
    );

    result = result.filter((o) => {
      if (!o.deadline) return false;
      const deadline = new Date(o.deadline);
      return deadline >= startToday && deadline <= twentyOneDaysFromToday;
    });
  }

  if (params.filters.stage !== "all") {
    result = result.filter((o) => o.stage === params.filters.stage);
  }
  if (params.filters.sourceType !== "all") {
    result = result.filter((o) => o.sourceType === params.filters.sourceType);
  }
  if (params.filters.opportunityType !== "all") {
    result = result.filter((o) => o.opportunityType === params.filters.opportunityType);
  }
  if (params.filters.company !== "all") {
    result = result.filter((o) => o.company.id === params.filters.company);
  }
  if (params.filters.tag !== "all") {
    result = result.filter((o) => o.tags.includes(params.filters.tag));
  }
  if (params.filters.search) {
    const q = params.filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.company.name.toLowerCase().includes(q)
    );
  }

  return [...result].sort((a, b) => {
    if (params.sort === "deadline") {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }

    if (params.sort === "company") {
      return a.company.name.localeCompare(b.company.name);
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function deriveOpportunityListOptions(params: {
  opportunities: OpportunityRow[];
}): {
  sourceTypes: string[];
  uniqueCompanies: Array<{ id: string; name: string }>;
  allTags: string[];
} {
  const sourceTypes = [...new Set(params.opportunities.map((o) => o.sourceType))];
  const uniqueCompanies = [
    ...new Map(
      params.opportunities.map((o) => [o.company.id, o.company])
    ).values(),
  ];
  const allTags = [...new Set(params.opportunities.flatMap((o) => o.tags))];

  return { sourceTypes, uniqueCompanies, allTags };
}
