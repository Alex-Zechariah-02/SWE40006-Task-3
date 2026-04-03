"use client";

import { ExternalLink } from "lucide-react";
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
        { label: "COMPANY", value: result.companyName },
        { label: "LOCATION", value: result.location },
        ...(result.remoteMode
          ? [{ label: "REMOTE", value: result.remoteMode.toUpperCase() }]
          : []),
        ...(result.opportunityType
          ? [{ label: "TYPE", value: result.opportunityType.toUpperCase() }]
          : []),
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {result && (
          <>
            <DialogHeader>
              <div className="type-mono-label text-muted-foreground mb-1">
                SOURCE // {result.sourceProvider.toUpperCase()}
              </div>
              <DialogTitle className="type-h2 font-display leading-snug text-balance">
                {result.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5">
              {metaRows.map(({ label, value }) => (
                <div key={label} className="type-mono-label text-muted-foreground">
                  {label}
                  {" // "}
                  {value}
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <p className="type-body text-foreground/90 text-pretty max-h-40 overflow-y-auto leading-relaxed">
                {result.snippet}
              </p>
            </div>

            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 type-small text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{result.sourceUrl}</span>
            </a>

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
