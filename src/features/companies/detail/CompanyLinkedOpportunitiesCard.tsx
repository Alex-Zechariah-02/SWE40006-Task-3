"use client";

import Link from "next/link";
import { StageBadge } from "@/components/ui/stage-badge";
import { TypeBadge } from "@/components/ui/type-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CompanyDetailData } from "./companyDetailTypes";

type Opportunity = CompanyDetailData["opportunities"][number];

type Props = {
  opportunities: Opportunity[];
};

export function CompanyLinkedOpportunitiesCard({ opportunities }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opportunities ({opportunities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? (
          <p className="type-small text-muted-foreground">No opportunities linked.</p>
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <Link
                  href={`/app/opportunities/${opp.id}`}
                  className="type-body text-foreground hover:text-primary transition-colors truncate"
                >
                  {opp.title}
                </Link>
                <div className="flex shrink-0 gap-2">
                  <StageBadge stage={opp.stage} />
                  <TypeBadge type={opp.opportunityType} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
