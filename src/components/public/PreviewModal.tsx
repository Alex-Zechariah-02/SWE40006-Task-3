"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
}

export function PreviewModal({ result, open, onOpenChange }: PreviewModalProps) {
  // Cache the last non-null result so the Dialog exit animation completes with content
  // visible. Without this, clearing `result` in the parent at the same time as
  // `open → false` would fire `return null` before base-ui can play the transition.
  const [displayResult, setDisplayResult] = useState<NormalizedResult | null>(null);

  useEffect(() => {
    if (result !== null) setDisplayResult(result);
  }, [result]);

  const metaRows = displayResult
    ? [
        { label: "COMPANY", value: displayResult.companyName },
        { label: "LOCATION", value: displayResult.location },
        ...(displayResult.remoteMode
          ? [{ label: "REMOTE", value: displayResult.remoteMode.toUpperCase() }]
          : []),
        ...(displayResult.opportunityType
          ? [{ label: "TYPE", value: displayResult.opportunityType.toUpperCase() }]
          : []),
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {displayResult && (
          <>
            <DialogHeader>
              <div className="type-mono-label text-muted-foreground mb-1">
                SOURCE // {displayResult.sourceProvider.toUpperCase()}
              </div>
              <DialogTitle className="type-h2 font-display leading-snug text-balance">
                {displayResult.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-1.5">
              {metaRows.map(({ label, value }) => (
                <div key={label} className="type-mono-label text-muted-foreground">
                  {label} // {value}
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-3">
              <p className="type-body text-foreground/90 text-pretty max-h-40 overflow-y-auto leading-relaxed">
                {displayResult.snippet}
              </p>
            </div>

            <a
              href={displayResult.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 type-small text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{displayResult.sourceUrl}</span>
            </a>

            <DialogFooter showCloseButton>
              <Link
                href="/login"
                className={buttonVariants({ variant: "default" })}
              >
                Save opportunity
              </Link>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
