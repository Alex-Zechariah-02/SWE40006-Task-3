"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabelValue } from "@/components/shared/LabelValue";
import { EmptyState } from "@/components/shared/EmptyState";
import { ActionItemCard } from "./ActionItemCard";
import { ActionItemModal } from "./ActionItemModal";
import {
  ClipboardCheck,
  Flag,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
} from "lucide-react";

interface ActionItemRow {
  id: string;
  title: string;
  description: string | null;
  dueAt: string | null;
  createdAt: string;
  priority: string;
  status: string;
  suggestedBySystem: boolean;
  company: { id: string; name: string } | null;
  opportunity: { id: string; title: string } | null;
  application: { id: string } | null;
  interview: { id: string; interviewType: string } | null;
}

interface ActionItemListSurfaceProps {
  actionItems: ActionItemRow[];
  linkOptions?: {
    companies?: Array<{ id: string; label: string }>;
    opportunities?: Array<{ id: string; label: string }>;
    applications?: Array<{ id: string; label: string }>;
    interviews?: Array<{ id: string; label: string }>;
  };
}

const PRIORITY_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  High: { label: "High", variant: "destructive" },
  Medium: { label: "Medium", variant: "default" },
  Low: { label: "Low", variant: "secondary" },
};

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "destructive" | "secondary" | "outline" }
> = {
  Open: { label: "Open", variant: "outline" },
  InProgress: { label: "In Progress", variant: "default" },
  Completed: { label: "Completed", variant: "secondary" },
  Cancelled: { label: "Cancelled", variant: "outline" },
};

type FilterKey =
  | "status"
  | "priority"
  | "companyId"
  | "opportunityId"
  | "applicationId"
  | "interviewId"
  | "linkedType"
  | "dueWindow";
type SortKey = "newest" | "dueDate" | "priority";
type ViewMode = "list" | "cards";

export function ActionItemListSurface({
  actionItems,
  linkOptions,
}: ActionItemListSurfaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    status: "all",
    priority: "all",
    companyId: "all",
    opportunityId: "all",
    applicationId: "all",
    interviewId: "all",
    linkedType: "all",
    dueWindow: "all",
  });
  const [sort, setSort] = React.useState<SortKey>("newest");
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ActionItemRow | null>(null);
  const [deletePending, setDeletePending] = React.useState<string | null>(null);

  function setFilter(key: FilterKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  React.useEffect(() => {
    let status = searchParams.get("status");
    if (status === "open") status = "openWork";
    if (status === "completed") status = "completedWork";

    const priority = searchParams.get("priority");
    const linkedType = searchParams.get("linkedType");
    const dueWindow = searchParams.get("dueWindow");
    const companyId = searchParams.get("companyId");
    const opportunityId = searchParams.get("opportunityId");
    const applicationId = searchParams.get("applicationId");
    const interviewId = searchParams.get("interviewId");
    const sortParam = searchParams.get("sort");

    setFilters((prev) => ({
      ...prev,
      status: status ?? prev.status,
      priority: priority ?? prev.priority,
      linkedType: linkedType ?? prev.linkedType,
      dueWindow: dueWindow ?? prev.dueWindow,
      companyId: companyId ?? prev.companyId,
      opportunityId: opportunityId ?? prev.opportunityId,
      applicationId: applicationId ?? prev.applicationId,
      interviewId: interviewId ?? prev.interviewId,
    }));

    if (sortParam === "newest" || sortParam === "dueDate" || sortParam === "priority") {
      setSort(sortParam);
    }
  }, [searchParams]);

  const filtered = React.useMemo(() => {
    let result: ActionItemRow[] = actionItems;

    if (filters.status !== "all") {
      if (filters.status === "openWork") {
        const openStatuses = new Set(["Open", "InProgress"]);
        result = result.filter((i: ActionItemRow) => openStatuses.has(i.status));
      } else if (filters.status === "completedWork") {
        result = result.filter((i: ActionItemRow) => i.status === "Completed");
      } else {
        result = result.filter((i: ActionItemRow) => i.status === filters.status);
      }
    }
    if (filters.priority !== "all") {
      result = result.filter((i: ActionItemRow) => i.priority === filters.priority);
    }
    if (filters.linkedType !== "all") {
      const linkedType = filters.linkedType;
      result = result.filter((i: ActionItemRow) => {
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
    if (filters.dueWindow !== "all") {
      const now = new Date();
      const startToday = new Date(now);
      startToday.setHours(0, 0, 0, 0);
      const dueSoonUntil = new Date(startToday);
      dueSoonUntil.setDate(dueSoonUntil.getDate() + 3);
      const terminalStatuses = new Set(["Completed", "Cancelled"]);

      result = result.filter((i: ActionItemRow) => {
        if (!i.dueAt) return filters.dueWindow === "noDue";
        if (terminalStatuses.has(i.status)) return false;
        const due = new Date(i.dueAt);

        if (filters.dueWindow === "overdue") return due < startToday;
        if (filters.dueWindow === "dueSoon") return due >= startToday && due <= dueSoonUntil;
        return true;
      });
    }
    if (filters.companyId !== "all") {
      result = result.filter(
        (i: ActionItemRow) => i.company?.id === filters.companyId
      );
    }
    if (filters.opportunityId !== "all") {
      result = result.filter(
        (i: ActionItemRow) => i.opportunity?.id === filters.opportunityId
      );
    }
    if (filters.applicationId !== "all") {
      result = result.filter(
        (i: ActionItemRow) => i.application?.id === filters.applicationId
      );
    }
    if (filters.interviewId !== "all") {
      result = result.filter(
        (i: ActionItemRow) => i.interview?.id === filters.interviewId
      );
    }

    result = [...result].sort((a, b) => {
      if (sort === "dueDate") {
        if (!a.dueAt && !b.dueAt) return 0;
        if (!a.dueAt) return 1;
        if (!b.dueAt) return -1;
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      }
      if (sort === "priority") {
        const order = { High: 0, Medium: 1, Low: 2 };
        const priorityDiff = (
          (order[a.priority as keyof typeof order] ?? 1) -
          (order[b.priority as keyof typeof order] ?? 1)
        );
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

    return result;
  }, [actionItems, filters, sort]);

  const companiesFromItems = React.useMemo(
    () =>
      [
        ...new Map(
          actionItems
            .filter((i: ActionItemRow) => i.company)
            .map((i: ActionItemRow) => [i.company!.id, i.company])
        ).values(),
      ] as { id: string; name: string }[],
    [actionItems]
  );

  const opportunitiesFromItems = React.useMemo(
    () =>
      [
        ...new Map(
          actionItems
            .filter((i: ActionItemRow) => i.opportunity)
            .map((i: ActionItemRow) => [i.opportunity!.id, i.opportunity])
        ).values(),
      ] as { id: string; title: string }[],
    [actionItems]
  );

  const companyOptions = linkOptions?.companies
    ?? companiesFromItems.map((c) => ({ id: c.id, label: c.name }));
  const opportunityOptions = linkOptions?.opportunities
    ?? opportunitiesFromItems.map((o) => ({ id: o.id, label: o.title }));
  const applicationOptions = linkOptions?.applications ?? [];
  const interviewOptions = linkOptions?.interviews ?? [];

  async function readErrorMessage(res: Response, fallback: string) {
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

  async function handleDelete(id: string) {
    setDeletePending(id);
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(await readErrorMessage(res, "Failed to delete."));
        return;
      }
      toast.success("Action item deleted.");
      router.refresh();
    } finally {
      setDeletePending(null);
    }
  }

  return (
    <div>
      {/* Toolbar: create + view toggle */}
      <div className="flex items-center justify-between pb-4">
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="mr-1.5 size-4" />
          New Action Item
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="size-10"
            onClick={() => setViewMode("list")}
            aria-label="List view"
            aria-pressed={viewMode === "list"}
            title="List view"
          >
            <List className="size-3.5" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "outline"}
            size="icon"
            className="size-10"
            onClick={() => setViewMode("cards")}
            aria-label="Cards view"
            aria-pressed={viewMode === "cards"}
            title="Cards view"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <Select
          value={filters.status}
          onValueChange={(v) => setFilter("status", v ?? "all")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="openWork">Open work</SelectItem>
            <SelectItem value="completedWork">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(v) => setFilter("priority", v ?? "all")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Priority" />
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
          onValueChange={(v) => setFilter("linkedType", v ?? "all")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Link" />
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
          onValueChange={(v) => setFilter("dueWindow", v ?? "all")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Due" />
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
            onValueChange={(v) => setFilter("companyId", v ?? "all")}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Company" />
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
            onValueChange={(v) => setFilter("opportunityId", v ?? "all")}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Opportunity" />
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

        <div className="ml-auto">
          <Select
            value={sort}
            onValueChange={(v) => setSort((v ?? "newest") as SortKey)}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="dueDate">Nearest due date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No action items"
          description={
            actionItems.length > 0
              ? "Try adjusting your filters."
              : "Create your first action item to start tracking tasks."
          }
          action={
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="mr-1.5 size-4" />
              New Action Item
            </Button>
          }
        />
      ) : viewMode === "cards" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              onEdit={() => setEditItem(item)}
              onDelete={() => handleDelete(item.id)}
              isDeleting={deletePending === item.id}
            />
          ))}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {filtered.map((item) => (
            <ActionItemRowItem
              key={item.id}
              item={item}
              onEdit={() => setEditItem(item)}
              onDelete={() => handleDelete(item.id)}
              isDeleting={deletePending === item.id}
            />
          ))}
        </div>
      )}

      <p className="mt-3 type-small text-muted-foreground">
        {filtered.length} of {actionItems.length} action items
      </p>

      {/* Create modal */}
      <ActionItemModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        mode="create"
        companies={companyOptions}
        opportunities={opportunityOptions}
        applications={applicationOptions}
        interviews={interviewOptions}
      />

      {/* Edit modal */}
      {editItem && (
        <ActionItemModal
          open={!!editItem}
          onOpenChange={(open) => {
            if (!open) setEditItem(null);
          }}
          mode="edit"
          existingItem={{
            id: editItem.id,
            title: editItem.title,
            description: editItem.description,
            dueAt: editItem.dueAt,
            priority: editItem.priority,
            status: editItem.status,
          }}
        />
      )}
    </div>
  );
}

function ActionItemRowItem({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: ActionItemRow;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const priorityCfg = PRIORITY_CONFIG[item.priority] ?? {
    label: item.priority,
    variant: "outline" as const,
  };
  const statusCfg = STATUS_CONFIG[item.status] ?? {
    label: item.status,
    variant: "outline" as const,
  };

  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="type-body font-medium text-foreground truncate">
            {item.title}
          </span>
          {item.suggestedBySystem && (
            <Badge variant="outline" className="type-small">
              System
            </Badge>
          )}
        </div>
        {item.description && (
          <p className="type-small text-muted-foreground line-clamp-1 mt-0.5">
            {item.description}
          </p>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <Badge variant={priorityCfg.variant} className="type-small gap-1">
            <Flag className="size-3" />
            {priorityCfg.label}
          </Badge>
          <Badge variant={statusCfg.variant} className="type-small">
            {statusCfg.label}
          </Badge>
          {item.dueAt && (
            <span className="inline-flex items-center gap-1 type-small text-muted-foreground">
              <Calendar className="size-3" />
              {new Date(item.dueAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
          {item.company && (
            <LabelValue label="CO" value={item.company.name} />
          )}
          {item.opportunity && (
            <LabelValue label="OPP" value={item.opportunity.title} />
          )}
          {item.application && (
            <LabelValue label="APP" value={item.application.id.slice(0, 8)} />
          )}
          {item.interview && (
            <LabelValue label="INT" value={item.interview.interviewType} />
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-10"
          onClick={onEdit}
          disabled={isDeleting}
          aria-label={`Edit ${item.title}`}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label={`Delete ${item.title}`}
          title="Delete"
          className="size-10 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
