"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { RowActions } from "@/components/shared/RowActions";
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
  const router = useRouter();

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
    <>
      <p className="mb-1 type-caption text-muted-foreground">
        Showing {companies.length} {companies.length === 1 ? "company" : "companies"}
      </p>
      <div className="divide-y divide-border rounded-xl border border-border shadow-sm">
        {companies.map((co) => (
          <div
            key={co.id}
            className="group/row flex items-center gap-4 px-4 py-4 transition-colors duration-100 hover:bg-muted/50"
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
                  <span className="type-small text-muted-foreground">
                    {co.industry}
                  </span>
                )}
                {co.location && (
                  <span className="type-small text-muted-foreground">
                    {co.location}
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="flex items-center justify-end gap-2 md:w-[calc(30ch+1rem)]">
                {co._count.opportunities > 0 && (
                  <Badge variant="outline" className="md:w-[9ch] md:justify-center">
                    {co._count.opportunities} opp{co._count.opportunities !== 1 && "s"}
                  </Badge>
                )}
                {co._count.contacts > 0 && (
                  <Badge variant="outline" className="md:w-[12ch] md:justify-center">
                    {co._count.contacts} contact{co._count.contacts !== 1 && "s"}
                  </Badge>
                )}
                {co._count.applications > 0 && (
                  <Badge variant="secondary" className="md:w-[9ch] md:justify-center">
                    {co._count.applications} app{co._count.applications !== 1 && "s"}
                  </Badge>
                )}
              </div>
              <RowActions
                onEdit={() => router.push(`/app/companies/${co.id}`)}
                label="Company actions"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
