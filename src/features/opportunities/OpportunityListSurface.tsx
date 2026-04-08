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
import { Lightbulb, Calendar } from "lucide-react";

interface OpportunityRow {
  id: string;
  title: string;
  opportunityType: string;
  remoteMode: string;
  stage: string;
  sourceType: string;
  location: string | null;
  deadline: string | null;
  tags: string[];
  createdAt: string;
  company: { id: string; name: string };
}

interface OpportunityListSurfaceProps {
  opportunities: OpportunityRow[];
}

const TYPE_LABELS: Record<string, string> = {
  Internship: "Internship",
  GraduateProgram: "Graduate Program",
  FullTime: "Full-time",
  PartTime: "Part-time",
  Contract: "Contract",
};

const REMOTE_LABELS: Record<string, string> = {
  OnSite: "On-site",
  Hybrid: "Hybrid",
  Remote: "Remote",
};

type FilterKey = "stage" | "sourceType" | "opportunityType";
type SortKey = "newest" | "deadline" | "company";

export function OpportunityListSurface({
  opportunities,
}: OpportunityListSurfaceProps) {
  const [filters, setFilters] = React.useState<Record<FilterKey, string>>({
    stage: "all",
    sourceType: "all",
    opportunityType: "all",
  });
  const [sort, setSort] = React.useState<SortKey>("newest");

  function setFilter(key: FilterKey, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filtered = React.useMemo(() => {
    let result = opportunities;

    if (filters.stage !== "all") {
      result = result.filter((o) => o.stage === filters.stage);
    }
    if (filters.sourceType !== "all") {
      result = result.filter((o) => o.sourceType === filters.sourceType);
    }
    if (filters.opportunityType !== "all") {
      result = result.filter(
        (o) => o.opportunityType === filters.opportunityType
      );
    }

    result = [...result].sort((a, b) => {
      if (sort === "deadline") {
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sort === "company") {
        return a.company.name.localeCompare(b.company.name);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [opportunities, filters, sort]);

  const sourceTypes = React.useMemo(
    () => [...new Set(opportunities.map((o) => o.sourceType))],
    [opportunities]
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
            <SelectItem value="Saved">Saved</SelectItem>
            <SelectItem value="Shortlisted">Shortlisted</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sourceType}
          onValueChange={(v) => setFilter("sourceType", v ?? "all")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {sourceTypes.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.opportunityType}
          onValueChange={(v) => setFilter("opportunityType", v ?? "all")}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
            <SelectItem value="GraduateProgram">Graduate Program</SelectItem>
            <SelectItem value="FullTime">Full-time</SelectItem>
            <SelectItem value="PartTime">Part-time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
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
              <SelectItem value="newest">Newest saved</SelectItem>
              <SelectItem value="deadline">Nearest deadline</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No opportunities found"
          description={
            opportunities.length > 0
              ? "Try adjusting your filters."
              : "Search for opportunities or add one manually."
          }
        />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/app/opportunities/${opp.id}`}
                    className="type-body font-medium text-foreground hover:text-primary transition-colors truncate"
                  >
                    {opp.title}
                  </Link>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link
                    href={`/app/companies/${opp.company.id}`}
                    className="type-small text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {opp.company.name}
                  </Link>
                  <LabelValue
                    label="TYPE"
                    value={TYPE_LABELS[opp.opportunityType] || opp.opportunityType}
                  />
                  <LabelValue label="MODE" value={REMOTE_LABELS[opp.remoteMode] || opp.remoteMode} />
                  {opp.location && (
                    <LabelValue label="LOC" value={opp.location} />
                  )}
                  {opp.deadline && (
                    <span className="inline-flex items-center gap-1 type-small text-muted-foreground">
                      <Calendar className="size-3" />
                      {new Date(opp.deadline).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
                {opp.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {opp.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="type-small">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Badge variant="secondary">
                  {opp.stage}
                </Badge>
                <Badge variant="outline">
                  {opp.sourceType}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 type-small text-muted-foreground">
        {filtered.length} of {opportunities.length} opportunities
      </p>
    </div>
  );
}
