import type {
  ActionItemLinkOptions,
  ActionItemRow,
  FilterKey,
  SortKey,
} from "./types";
import type { EntityOption } from "../types";

type SearchParamsLike = {
  get(name: string): string | null;
};

export function applySearchParamsToActionItemListFilters(params: {
  searchParams: SearchParamsLike;
  prevFilters: Record<FilterKey, string>;
}): Record<FilterKey, string> {
  let status = params.searchParams.get("status");
  if (status === "open") status = "openWork";
  if (status === "completed") status = "completedWork";

  const priority = params.searchParams.get("priority");
  const linkedType = params.searchParams.get("linkedType");
  const dueWindow = params.searchParams.get("dueWindow");
  const companyId = params.searchParams.get("companyId");
  const opportunityId = params.searchParams.get("opportunityId");
  const applicationId = params.searchParams.get("applicationId");
  const interviewId = params.searchParams.get("interviewId");

  return {
    ...params.prevFilters,
    status: status ?? params.prevFilters.status,
    priority: priority ?? params.prevFilters.priority,
    linkedType: linkedType ?? params.prevFilters.linkedType,
    dueWindow: dueWindow ?? params.prevFilters.dueWindow,
    companyId: companyId ?? params.prevFilters.companyId,
    opportunityId: opportunityId ?? params.prevFilters.opportunityId,
    applicationId: applicationId ?? params.prevFilters.applicationId,
    interviewId: interviewId ?? params.prevFilters.interviewId,
  };
}

export function parseActionItemListSort(params: {
  searchParams: SearchParamsLike;
  prevSort: SortKey;
}): SortKey {
  const sortParam = params.searchParams.get("sort");
  if (sortParam === "newest" || sortParam === "dueDate" || sortParam === "priority") {
    return sortParam as SortKey;
  }

  return params.prevSort;
}

export function filterAndSortActionItems(params: {
  actionItems: ActionItemRow[];
  filters: Record<FilterKey, string>;
  sort: SortKey;
}): ActionItemRow[] {
  let result: ActionItemRow[] = params.actionItems;

  if (params.filters.status !== "all") {
    if (params.filters.status === "openWork") {
      const openStatuses = new Set(["Open", "InProgress"]);
      result = result.filter((i) => openStatuses.has(i.status));
    } else if (params.filters.status === "completedWork") {
      result = result.filter((i) => i.status === "Completed");
    } else {
      result = result.filter((i) => i.status === params.filters.status);
    }
  }

  if (params.filters.priority !== "all") {
    result = result.filter((i) => i.priority === params.filters.priority);
  }

  if (params.filters.linkedType !== "all") {
    const linkedType = params.filters.linkedType;
    result = result.filter((i) => {
      const type = i.interview
        ? "interview"
        : i.application
          ? "application"
          : i.opportunity
            ? "opportunity"
            : i.company
              ? "company"
              : "none";
      return type === linkedType;
    });
  }

  if (params.filters.dueWindow !== "all") {
    const now = new Date();
    const startToday = new Date(now);
    startToday.setHours(0, 0, 0, 0);
    const dueSoonUntil = new Date(startToday);
    dueSoonUntil.setDate(dueSoonUntil.getDate() + 3);
    const terminalStatuses = new Set(["Completed", "Cancelled"]);

    result = result.filter((i) => {
      if (!i.dueAt) return params.filters.dueWindow === "noDue";
      if (terminalStatuses.has(i.status)) return false;
      const due = new Date(i.dueAt);

      if (params.filters.dueWindow === "overdue") return due < startToday;
      if (params.filters.dueWindow === "dueSoon") {
        return due >= startToday && due <= dueSoonUntil;
      }
      return true;
    });
  }

  if (params.filters.companyId !== "all") {
    result = result.filter((i) => i.company?.id === params.filters.companyId);
  }
  if (params.filters.opportunityId !== "all") {
    result = result.filter((i) => i.opportunity?.id === params.filters.opportunityId);
  }
  if (params.filters.applicationId !== "all") {
    result = result.filter((i) => i.application?.id === params.filters.applicationId);
  }
  if (params.filters.interviewId !== "all") {
    result = result.filter((i) => i.interview?.id === params.filters.interviewId);
  }

  return [...result].sort((a, b) => {
    if (params.sort === "dueDate") {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    }

    if (params.sort === "priority") {
      const order = { High: 0, Medium: 1, Low: 2 };
      const priorityDiff =
        (order[a.priority as keyof typeof order] ?? 1) -
        (order[b.priority as keyof typeof order] ?? 1);
      if (priorityDiff !== 0) return priorityDiff;

      if (a.dueAt && b.dueAt) {
        const dueDiff = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        if (dueDiff !== 0) return dueDiff;
      } else if (a.dueAt && !b.dueAt) {
        return -1;
      } else if (!a.dueAt && b.dueAt) {
        return 1;
      }
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function deriveActionItemLinkOptions(params: {
  actionItems: ActionItemRow[];
  linkOptions?: ActionItemLinkOptions;
}): {
  companyOptions: EntityOption[];
  opportunityOptions: EntityOption[];
  applicationOptions: EntityOption[];
  interviewOptions: EntityOption[];
} {
  const companiesFromItems = [
    ...new Map(
      params.actionItems
        .filter((i) => i.company)
        .map((i) => [i.company!.id, i.company])
    ).values(),
  ] as { id: string; name: string }[];

  const opportunitiesFromItems = [
    ...new Map(
      params.actionItems
        .filter((i) => i.opportunity)
        .map((i) => [i.opportunity!.id, i.opportunity])
    ).values(),
  ] as { id: string; title: string }[];

  const companyOptions =
    params.linkOptions?.companies ??
    companiesFromItems.map((c) => ({ id: c.id, label: c.name }));
  const opportunityOptions =
    params.linkOptions?.opportunities ??
    opportunitiesFromItems.map((o) => ({ id: o.id, label: o.title }));
  const applicationOptions = params.linkOptions?.applications ?? [];
  const interviewOptions = params.linkOptions?.interviews ?? [];

  return {
    companyOptions,
    opportunityOptions,
    applicationOptions,
    interviewOptions,
  };
}

export async function readActionItemDeleteErrorMessage(
  res: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await res.clone().json();
    if (typeof data?.error?.message === "string") return data.error.message;
  } catch {
    // ignore
  }

  try {
    const text = await res.text();
    if (text) return text.slice(0, 200);
  } catch {
    // ignore
  }

  return fallback;
}
