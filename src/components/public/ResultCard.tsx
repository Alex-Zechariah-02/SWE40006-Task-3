"use client";

import { Bookmark } from "lucide-react";
import { LabelValue } from "@/components/shared/LabelValue";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import type { NormalizedResult } from "@/types/search";

interface ResultCardProps {
  result: NormalizedResult;
  onViewDetails: (result: NormalizedResult) => void;
  onSave: (result: NormalizedResult) => void;
}

export function ResultCard({ result, onViewDetails, onSave }: ResultCardProps) {
  const metaParts = [
    result.companyName,
    result.location,
    result.remoteMode,
  ].filter(Boolean);

  return (
    <Card interactive size="sm" role="article">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <LabelValue label="Source" value={result.sourceProvider} />
          {result.opportunityType && (
            <LabelValue label="Type" value={result.opportunityType} />
          )}
        </div>

        <h3 className="type-h3 font-display font-semibold text-balance">{result.title}</h3>

        {metaParts.length > 0 && (
          <p className="text-sm text-muted-foreground">
            {metaParts.join(" · ")}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {result.snippet && (
          <p className="type-small text-foreground/80 line-clamp-2 text-pretty">
            {result.snippet}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(result)}
          >
            View details
          </Button>
          <button
            type="button"
            className={buttonVariants({ variant: "default", size: "sm" })}
            onClick={() => onSave(result)}
          >
            <Bookmark className="h-3.5 w-3.5" aria-hidden />
            Save
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
