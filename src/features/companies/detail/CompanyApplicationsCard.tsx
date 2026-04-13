"use client";

import Link from "next/link";
import { StageBadge } from "@/components/ui/stage-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CompanyDetailData } from "./companyDetailTypes";

type Application = CompanyDetailData["applications"][number];

type Props = {
  applications: Application[];
  applicationCount: number;
};

export function CompanyApplicationsCard({
  applications,
  applicationCount,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications ({applicationCount})</CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="type-small text-muted-foreground">No applications yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {applications.map((application) => (
              <li
                key={application.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Link
                    href={`/app/applications/${application.id}`}
                    className="type-small truncate font-medium hover:text-primary"
                  >
                    {application.opportunity.title}
                  </Link>
                  {application.appliedDate && (
                    <span className="type-small text-muted-foreground">
                      Applied{" "}
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <StageBadge stage={application.currentStage} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
