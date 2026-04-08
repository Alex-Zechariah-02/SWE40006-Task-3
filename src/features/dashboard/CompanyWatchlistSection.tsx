"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";

interface CompanyWatchlistSectionProps {
  companies: Array<{
    id: string;
    name: string;
    activeApplications: number;
    upcomingDeadlines: number;
  }>;
}

export function CompanyWatchlistSection({
  companies,
}: CompanyWatchlistSectionProps) {
  if (companies.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No companies to watch."
        description="Add companies to track their opportunities."
        action={
          <Link
            href="/app/companies"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View companies
          </Link>
        }
      />
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="type-mono-label text-muted-foreground">
          Company Watchlist
        </p>
        <ul className="mt-3 space-y-3">
          {companies.map((company) => (
            <li key={company.id} className="flex items-center justify-between">
              <Link
                href={`/app/companies/${company.id}`}
                className="type-body font-medium text-foreground transition-colors hover:text-primary"
              >
                {company.name}
              </Link>
              <div className="flex shrink-0 items-center gap-3">
                <span className="type-mono-label text-muted-foreground">
                  {company.activeApplications} application
                  {company.activeApplications !== 1 ? "s" : ""}
                </span>
                <span className="type-mono-label text-muted-foreground">
                  {company.upcomingDeadlines} deadline
                  {company.upcomingDeadlines !== 1 ? "s" : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
