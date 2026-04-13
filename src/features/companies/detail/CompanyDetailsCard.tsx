"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

type Props = {
  industry: string | null;
  location: string | null;
  website: string | null;
  applicationCount: number;
};

export function CompanyDetailsCard({
  industry,
  location,
  website,
  applicationCount,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3">
          {industry && (
            <div>
              <dt className="type-caption font-medium text-muted-foreground">Industry</dt>
              <dd className="mt-1">{industry}</dd>
            </div>
          )}
          {location && (
            <div>
              <dt className="type-caption font-medium text-muted-foreground">Location</dt>
              <dd className="mt-1">{location}</dd>
            </div>
          )}
          {website && (
            <div>
              <dt className="type-caption font-medium text-muted-foreground">Website</dt>
              <dd className="mt-1">
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  {new URL(website).hostname}
                  <ExternalLink className="size-3" />
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="type-caption font-medium text-muted-foreground">Applications</dt>
            <dd className="mt-1">{applicationCount}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
