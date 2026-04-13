"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import type { ViewMode } from "./types";

export function ActionItemToolbar({
  viewMode,
  onViewModeChange,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-center justify-end pb-4">
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          size="icon"
          className="size-10"
          onClick={() => onViewModeChange("list")}
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
          onClick={() => onViewModeChange("cards")}
          aria-label="Cards view"
          aria-pressed={viewMode === "cards"}
          title="Cards view"
        >
          <LayoutGrid className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

