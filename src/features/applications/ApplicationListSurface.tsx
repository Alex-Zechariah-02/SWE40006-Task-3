"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LabelValue } from "@/components/shared/LabelValue";
import { EmptyState } from "@/components/shared/EmptyState";
import { Briefcase, Calendar } from "lucide-react";

interface ApplicationRow {
  id: string;
  currentStage: string;
  priority: string;
  appliedDate: string | null;
  statusNotes: string | null;
  tags: string[];
  archivedAt: string | null;
  createdAt: string;
  opportunity: { id: string; title: string };
  company: { id: string; name: string };
}

interface ApplicationListSurfaceProps {
  applications: ApplicationRow[];
}

const STAGE_LABELS: Record<string, string> = {
  Applied: "Applied",
  Assessment: "Assessment",
  Interview: "Interview",
  Offer: "Offer",
  Rejected: "Rejected",
  Withdrawn: "Withdrawn",
};

const PRIORITY_LABELS: Record<string, string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
};

type FilterKey = "stage" | "priority" | "tag" | "activeOnly" | "includeArchived";
type SortKey = "newest" | "appliedDate" | "company" | "priority";

export function ApplicationListSurface({
  applications,
}: ApplicationListSurfaceProps) {
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    stage: "all",
    priority: "all",
    tag: "all",
    activeOnly: "true",
    includeArchived: "false",
  });
  const [sort, setSort] = React.useState<SortKey>("newest");

  function setFilter(key: FilterKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filtered = React.useMemo(() => {
    let result = applications;

    if (filters.includeArchived !== "true") {
      result = result.filter((a) => !a.archivedAt);
    }

    if (filters.activeOnly === "true") {
      const activeStages = new Set(["Applied", "Assessment", "Interview"]);
      result = result.filter((a) => activeStages.has(a.currentStage));
    }

    if (filters.stage !== "all") {
      result = result.filter((a) => a.currentStage === filters.stage);
    }
    if (filters.priority !== "all") {
      result = result.filter((a) => a.priority === filters.priority);
    }
    if (filters.tag !== "all") {
      result = result.filter((a) => a.tags.includes(filters.tag));
    }

    const priorityOrder = { High: 0, Medium: 1, Low: 2 };

    result = [...result].sort((a, b) => {
      if (sort === "appliedDate") {
        if (!a.appliedDate && !b.appliedDate) return 0;
        if (!a.appliedDate) return 1;
        if (!b.appliedDate) return -1;
        return (
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        );
      }
      if (sort === "company") {
        return a.company.name.localeCompare(b.company.name);
      }
      if (sort === "priority") {
        return (
          (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 1) -
          (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 1)
        );
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [applications, filters, sort]);

  const allTags = React.useMemo(
    () => [...new Set(applications.flatMap((a) => a.tags))],
    [applications]
  );

  return (
    <div>
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2 pb-4">
        <Select
          value={filters.stage}
          onValueChange={(v) => setFilter("stage", v ?? "all")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {Object.keys(STAGE_LABELS).map((s) => (
              <SelectItem key={s} value={s}>
                {STAGE_LABELS[s]}
              </SelectItem>
            ))}
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
            {Object.keys(PRIORITY_LABELS).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {allTags.length > 0 && (
          <Select
            value={filters.tag}
            onValueChange={(v) => setFilter("tag", v ?? "all")}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={filters.activeOnly}
          onValueChange={(v) => setFilter("activeOnly", v ?? "true")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Active stages</SelectItem>
            <SelectItem value="false">All stages</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.includeArchived}
          onValueChange={(v) => setFilter("includeArchived", v ?? "false")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Archive" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">Hide archived</SelectItem>
            <SelectItem value="true">Include archived</SelectItem>
          </SelectContent>
        </Select>

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
              <SelectItem value="appliedDate">Date applied</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No applications found"
          description={
            applications.length > 0
              ? "Try adjusting your filters."
              : "Convert an opportunity to start tracking applications."
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/app/applications/${app.id}`}
                    className="type-body font-medium text-foreground hover:text-primary transition-colors truncate"
                  >
                    {app.opportunity.title}
                  </Link>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link
                    href={`/app/companies/${app.company.id}`}
                    className="type-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {app.company.name}
                  </Link>
                  <LabelValue
                    label="STAGE"
                    value={STAGE_LABELS[app.currentStage] || app.currentStage}
                  />
                  <LabelValue
                    label="PRIORITY"
                    value={PRIORITY_LABELS[app.priority] || app.priority}
                  />
                  {app.appliedDate && (
                    <span className="inline-flex items-center gap-1 type-small text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(app.appliedDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {app.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {app.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="type-small">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant="secondary">
                  {STAGE_LABELS[app.currentStage] || app.currentStage}
                </Badge>
                <Badge
                  variant={
                    app.priority === "High"
                      ? "destructive"
                      : app.priority === "Medium"
                        ? "default"
                        : "outline"
                  }
                >
                  {PRIORITY_LABELS[app.priority] || app.priority}
                </Badge>
                {app.archivedAt && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 type-small text-muted-foreground">
        {filtered.length} of {applications.length} applications
      </p>
    </div>
  );
}
