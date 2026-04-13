"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ActionItemModal } from "./ActionItemModal";
import type {
  ActionItemRow,
  ActionItemListSurfaceProps,
  FilterKey,
  SortKey,
  ViewMode,
} from "./list/types";
import { ActionItemFiltersRow } from "./list/ActionItemFiltersRow";
import { ActionItemResults } from "./list/ActionItemResults";
import {
  applySearchParamsToActionItemListFilters,
  deriveActionItemLinkOptions,
  filterAndSortActionItems,
  parseActionItemListSort,
  readActionItemDeleteErrorMessage,
} from "./list/logic";

const DEFAULT_ACTION_ITEM_FILTERS: Record<FilterKey, string> = {
  status: "all",
  priority: "all",
  companyId: "all",
  opportunityId: "all",
  applicationId: "all",
  interviewId: "all",
  linkedType: "all",
  dueWindow: "all",
};

export function ActionItemListSurface({
  actionItems,
  linkOptions,
}: ActionItemListSurfaceProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    ...DEFAULT_ACTION_ITEM_FILTERS,
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
    setFilters((prev) =>
      applySearchParamsToActionItemListFilters({
        searchParams,
        prevFilters: prev,
      })
    );
    setSort((prev) =>
      parseActionItemListSort({ searchParams, prevSort: prev })
    );
  }, [searchParams]);

  const filtered = React.useMemo(
    () => filterAndSortActionItems({ actionItems, filters, sort }),
    [actionItems, filters, sort]
  );

  const {
    companyOptions,
    opportunityOptions,
    applicationOptions,
    interviewOptions,
  } = React.useMemo(
    () => deriveActionItemLinkOptions({ actionItems, linkOptions }),
    [actionItems, linkOptions]
  );
  const isFiltered = (Object.keys(DEFAULT_ACTION_ITEM_FILTERS) as FilterKey[]).some(
    (key) => filters[key] !== DEFAULT_ACTION_ITEM_FILTERS[key]
  );

  function handleClearFilters() {
    setFilters({ ...DEFAULT_ACTION_ITEM_FILTERS });
  }

  async function handleDelete(id: string) {
    setDeletePending(id);
    try {
      const res = await fetch(`/api/actions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(
          await readActionItemDeleteErrorMessage(res, "Failed to delete.")
        );
        return;
      }
      toast.success("Deleted.");
      router.refresh();
    } finally {
      setDeletePending(null);
    }
  }

  return (
    <div>
      <ActionItemFiltersRow
        filters={filters}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        companyOptions={companyOptions}
        opportunityOptions={opportunityOptions}
      />

      <ActionItemResults
        actionItems={actionItems}
        filtered={filtered}
        viewMode={viewMode}
        deletePendingId={deletePending}
        onCreate={() => setCreateOpen(true)}
        isFiltered={isFiltered}
        onClearFilters={handleClearFilters}
        onEdit={(item) => setEditItem(item)}
        onDelete={(item) => void handleDelete(item.id)}
      />

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
          key={editItem.id}
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
