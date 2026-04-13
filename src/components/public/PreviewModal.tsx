"use client";

import { ExternalLink } from "lucide-react";
import { LabelValue } from "@/components/shared/LabelValue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import type { NormalizedResult } from "@/types/search";

interface PreviewModalProps {
  result: NormalizedResult | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (result: NormalizedResult) => void;
}

export function PreviewModal({
  result,
  open,
  onOpenChange,
  onSave,
}: PreviewModalProps) {
  const metaRows = result
    ? [
        { label: "Company", value: result.companyName },
        { label: "Location", value: result.location },
        ...(result.remoteMode
          ? [{ label: "Remote", value: result.remoteMode.toUpperCase() }]
          : []),
        ...(result.opportunityType
          ? [{ label: "Type", value: result.opportunityType.toUpperCase() }]
          : []),
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" data-testid="preview-modal">
        {result && (
          <>
            <DialogHeader>
              <div className="mb-1">
                <LabelValue label="Source" value={result.sourceProvider.toUpperCase()} />
              </div>
              <DialogTitle className="type-h2 font-display leading-snug text-balance">
                {result.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              {metaRows.map(({ label, value }) => (
                <div key={label}>
                  <LabelValue label={label} value={value} />
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <p className="type-body text-foreground/90 text-pretty max-h-40 overflow-y-auto leading-relaxed">
                {result.snippet}
              </p>
            </div>

            <div className="w-full min-w-0">
              <a
                href={result.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full min-w-0 items-center gap-2 type-small text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                <span className="min-w-0 truncate">{result.sourceUrl}</span>
              </a>
            </div>

            <DialogFooter showCloseButton>
              <button
                type="button"
                className={buttonVariants({ variant: "default" })}
                onClick={() => onSave(result)}
              >
                Save opportunity
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
