"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/shared/CopyButton";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import type { OpportunityDetailData } from "./opportunityDetailTypes";

type Props = {
  opportunity: OpportunityDetailData;
};

export function OpportunityDetailsCard({ opportunity }: Props) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <DetailField label="Location" value={opportunity.location} />
          <DetailField
            label="Deadline"
            value={
              opportunity.deadline
                ? new Date(opportunity.deadline).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : null
            }
          />
          <DetailField label="Source provider" value={opportunity.sourceProvider} />
          {opportunity.sourceUrl && (
            <div>
              <p className="type-caption font-medium text-muted-foreground pb-1">
                Source URL
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={opportunity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="type-small text-primary hover:underline inline-flex items-center gap-1"
                >
                  {new URL(opportunity.sourceUrl).hostname}
                  <ExternalLink className="size-3" />
                </a>
                <CopyButton value={opportunity.sourceUrl} label="source URL" />
              </div>
            </div>
          )}
          {opportunity.importedAt && (
            <DetailField
              label="Imported"
              value={new Date(opportunity.importedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
          )}
          <DetailField
            label="Saved"
            value={new Date(opportunity.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
        </div>

        {opportunity.tags.length > 0 && (
          <div>
            <p className="type-caption font-medium text-muted-foreground pb-2">Tags</p>
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {opportunity.snippet && (
          <div>
            <p className="type-caption font-medium text-muted-foreground pb-2">Snippet</p>
            <p className="type-body text-foreground/90 whitespace-pre-wrap">
              {opportunity.snippet}
            </p>
          </div>
        )}

        {opportunity.description && (
          <div>
            <p className="type-caption font-medium text-muted-foreground pb-2">
              Description
            </p>
            <p className="type-body text-foreground/90 whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </div>
        )}

        {opportunity.notes && (
          <div>
            <p className="type-caption font-medium text-muted-foreground pb-2">Notes</p>
            <p className="type-body text-foreground/90 whitespace-pre-wrap">
              {opportunity.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div>
      <p className="type-caption font-medium text-muted-foreground pb-1">{label}</p>
      <p className="type-body">{value}</p>
    </div>
  );
}
