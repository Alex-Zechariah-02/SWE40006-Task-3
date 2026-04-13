"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="type-section-label text-muted-foreground">
          Watchlist
        </CardTitle>
      </CardHeader>
      <CardContent>
        {companies.length === 0 ? (
          <p className="type-small text-muted-foreground py-2">
            No companies tracked yet.
          </p>
        ) : (
          <>
            <ul className="grid gap-2">
              {companies.slice(0, 5).map((company) => (
                <li key={company.id} className="flex items-center justify-between gap-2">
                  <Link
                    href={`/app/companies/${company.id}`}
                    className="type-small font-medium text-foreground transition-colors hover:text-primary truncate"
                  >
                    {company.name}
                  </Link>
                  <span className="type-mono-label shrink-0 text-muted-foreground text-[0.65rem]">
                    {company.activeApplications} app{company.activeApplications !== 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href="/app/companies"
              className={buttonVariants({ variant: "link", size: "sm" }) + " mt-2 px-0"}
            >
              View all →
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}
