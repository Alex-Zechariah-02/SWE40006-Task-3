"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LabelValue } from "@/components/shared/LabelValue";
import { buttonVariants } from "@/components/ui/button";
import { Building2 } from "lucide-react";

interface CompanyRow {
  id: string;
  name: string;
  location: string | null;
  industry: string | null;
  _count: {
    opportunities: number;
    contacts: number;
    applications: number;
  };
}

export function CompanyListSurface({
  companies,
}: {
  companies: CompanyRow[];
}) {
  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No companies yet"
        description="Companies will appear here as you track opportunities or add them directly."
        action={
          <Link
            href="/search"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Search opportunities
          </Link>
        }
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {companies.map((co) => (
        <div
          key={co.id}
          className="flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/app/companies/${co.id}`}
              className="type-body font-medium text-foreground hover:text-primary transition-colors"
            >
              {co.name}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              {co.industry && (
                <LabelValue label="INDUSTRY" value={co.industry} />
              )}
              {co.location && (
                <LabelValue label="LOC" value={co.location} />
              )}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {co._count.opportunities > 0 && (
              <Badge variant="outline">
                {co._count.opportunities} opp{co._count.opportunities !== 1 && "s"}
              </Badge>
            )}
            {co._count.contacts > 0 && (
              <Badge variant="outline">
                {co._count.contacts} contact{co._count.contacts !== 1 && "s"}
              </Badge>
            )}
            {co._count.applications > 0 && (
              <Badge variant="secondary">
                {co._count.applications} app{co._count.applications !== 1 && "s"}
              </Badge>
            )}
          </div>
        </div>
      ))}
      <p className="px-4 py-2 type-small text-muted-foreground">
        {companies.length} {companies.length === 1 ? "company" : "companies"}
      </p>
    </div>
  );
}
