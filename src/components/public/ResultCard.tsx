"use client";

import { Bookmark } from "lucide-react";
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
    <article className="border-b border-border py-5 last:border-b-0">
      <div className="type-mono-label text-muted-foreground mb-2">
        SOURCE // {result.sourceProvider.toUpperCase()}
        {result.opportunityType && (
          <> · TYPE // {result.opportunityType.toUpperCase()}</>
        )}
      </div>

      <h3 className="type-h3 font-medium text-balance mb-1">{result.title}</h3>

      {metaParts.length > 0 && (
        <p className="type-small text-muted-foreground mb-3">
          {metaParts.join(" · ")}
        </p>
      )}

      {result.snippet && (
        <p className="type-small text-foreground/80 line-clamp-3 mb-4 text-pretty">
          {result.snippet}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onViewDetails(result)}
        >
          View details
        </Button>
        <button
          type="button"
          className={buttonVariants({ variant: "outline", size: "sm" })}
          onClick={() => onSave(result)}
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden />
          Save
        </button>
      </div>
    </article>
  );
}
