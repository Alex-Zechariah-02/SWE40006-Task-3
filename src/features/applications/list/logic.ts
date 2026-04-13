import type { ApplicationRow, FilterKey, SortKey } from "./types";

type SearchParamsLike = {
  get(name: string): string | null;
};

export function applySearchParamsToApplicationListFilters(params: {
  searchParams: SearchParamsLike;
  prevFilters: Record<FilterKey, string>;
}): Record<FilterKey, string> {
  const stage = params.searchParams.get("stage");
  const company = params.searchParams.get("company");
  const opportunityType = params.searchParams.get("opportunityType");
  const priority = params.searchParams.get("priority");
  const tag = params.searchParams.get("tag");
  const activeOnly = params.searchParams.get("activeOnly");
  const includeArchived = params.searchParams.get("includeArchived");
  const search = params.searchParams.get("search");

  return {
    ...params.prevFilters,
    stage: stage ?? params.prevFilters.stage,
    company: company ?? params.prevFilters.company,
    opportunityType: opportunityType ?? params.prevFilters.opportunityType,
    priority: priority ?? params.prevFilters.priority,
    tag: tag ?? params.prevFilters.tag,
    activeOnly: activeOnly ?? params.prevFilters.activeOnly,
    includeArchived: includeArchived ?? params.prevFilters.includeArchived,
    search: search ?? params.prevFilters.search,
  };
}

export function parseApplicationListSort(params: {
  searchParams: SearchParamsLike;
  prevSort: SortKey;
}): SortKey {
  const sortParam = params.searchParams.get("sort");
  if (
    sortParam === "newest" ||
    sortParam === "deadline" ||
    sortParam === "urgent" ||
    sortParam === "company"
  ) {
    return sortParam as SortKey;
  }

  return params.prevSort;
}

export function deriveApplicationListOptions(applications: ApplicationRow[]): {
  allTags: string[];
  uniqueCompanies: Array<{ id: string; name: string }>;
} {
  const allTags = [...new Set(applications.flatMap((a) => a.tags))];
  const uniqueCompanies = [
    ...new Map(applications.map((a) => [a.company.id, a.company])).values(),
  ];
  return { allTags, uniqueCompanies };
}

export function filterAndSortApplications(params: {
  applications: ApplicationRow[];
  filters: Record<FilterKey, string>;
  sort: SortKey;
}): ApplicationRow[] {
  let result = params.applications;

  if (params.filters.includeArchived !== "true") {
    result = result.filter((a) => !a.archivedAt);
  }

  if (params.filters.activeOnly === "true") {
    const activeStages = new Set(["Applied", "Assessment", "Interview"]);
    result = result.filter((a) => activeStages.has(a.currentStage));
  }

  if (params.filters.stage !== "all") {
    result = result.filter((a) => a.currentStage === params.filters.stage);
  }
  if (params.filters.company !== "all") {
    result = result.filter((a) => a.company.id === params.filters.company);
  }
  if (params.filters.opportunityType !== "all") {
    result = result.filter(
      (a) => a.opportunity.opportunityType === params.filters.opportunityType
    );
  }
  if (params.filters.priority !== "all") {
    result = result.filter((a) => a.priority === params.filters.priority);
  }
  if (params.filters.tag !== "all") {
    result = result.filter((a) => a.tags.includes(params.filters.tag));
  }
  if (params.filters.search) {
    const q = params.filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.opportunity.title.toLowerCase().includes(q) ||
        a.company.name.toLowerCase().includes(q)
    );
  }

  const priorityOrder = { High: 0, Medium: 1, Low: 2 };

  return [...result].sort((a, b) => {
    if (params.sort === "company") {
      return a.company.name.localeCompare(b.company.name);
    }

    if (params.sort === "deadline") {
      const aDeadline = a.opportunity.deadline
        ? new Date(a.opportunity.deadline)
        : null;
      const bDeadline = b.opportunity.deadline
        ? new Date(b.opportunity.deadline)
        : null;

      if (!aDeadline && !bDeadline) return 0;
      if (!aDeadline) return 1;
      if (!bDeadline) return -1;
      return aDeadline.getTime() - bDeadline.getTime();
    }

    if (params.sort === "urgent") {
      const pri =
        (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1);
      if (pri !== 0) return pri;

      const aDeadline = a.opportunity.deadline
        ? new Date(a.opportunity.deadline)
        : null;
      const bDeadline = b.opportunity.deadline
        ? new Date(b.opportunity.deadline)
        : null;
      if (aDeadline && bDeadline) {
        const deadlineDiff = aDeadline.getTime() - bDeadline.getTime();
        if (deadlineDiff !== 0) return deadlineDiff;
      } else if (aDeadline && !bDeadline) {
        return -1;
      } else if (!aDeadline && bDeadline) {
        return 1;
      }
    }

    return (
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  });
}
