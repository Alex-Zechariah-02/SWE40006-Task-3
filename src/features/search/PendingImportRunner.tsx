"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Download, Search } from "lucide-react";

import { clearPendingImport, readPendingImport } from "@/features/search/pendingImport";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";

type Status = "checking" | "importing" | "missing" | "success" | "failed";

export function PendingImportRunner() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState<string | null>(null);

  const wrapperProps = {
    "data-testid": "pending-import",
    "data-state": status,
  } as const;

  useEffect(() => {
    async function run() {
      const envelope = readPendingImport();
      if (!envelope) {
        setStatus("missing");
        return;
      }

      setStatus("importing");

      try {
        const res = await fetch("/api/opportunities/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(envelope.payload),
        });

        const json: unknown = await res.json().catch(() => null);

        if (!res.ok) {
          const errorText =
            typeof json === "object" &&
            json !== null &&
            "error" in json &&
            typeof (json as { error?: unknown }).error === "object" &&
            (json as { error?: { message?: unknown } }).error !== null &&
            typeof (json as { error?: { message?: unknown } }).error?.message ===
              "string"
              ? (json as { error: { message: string } }).error.message
              : "Import failed. Please try again.";

          setMessage(errorText);
          setStatus("failed");
          return;
        }

        const opportunityId =
          typeof json === "object" &&
          json !== null &&
          "opportunityId" in json &&
          typeof (json as { opportunityId?: unknown }).opportunityId === "string"
            ? (json as { opportunityId: string }).opportunityId
            : null;

        if (!opportunityId) {
          setMessage("Import failed. Please try again.");
          setStatus("failed");
          return;
        }

        clearPendingImport();
        setStatus("success");
        router.replace(`/app/opportunities/${encodeURIComponent(opportunityId)}`);
      } catch {
        setMessage("Import failed. Please try again.");
        setStatus("failed");
      }
    }

    void run();
  }, [router]);

  if (status === "missing") {
    return (
      <div {...wrapperProps}>
        <EmptyState
          icon={Download}
          title="Nothing to import"
          description="Return to search and save an opportunity to import it here."
          action={
            <Link href="/search" className={buttonVariants({ variant: "outline" })}>
              <Search className="h-4 w-4" aria-hidden />
              Back to search
            </Link>
          }
        />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div {...wrapperProps} className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-1 h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <div className="font-medium">Import failed</div>
            <div className="mt-1 text-destructive/90">{message}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/search" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Back to search
          </Link>
          <button
            type="button"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            onClick={() => {
              clearPendingImport();
              router.replace("/search");
            }}
          >
            Clear pending import
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div {...wrapperProps} className="rounded-md border border-border bg-card px-4 py-3 text-sm" role="status">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--status-success)]" aria-hidden />
          <div>
            <div className="font-medium">Imported</div>
            <div className="mt-1 text-muted-foreground">
              Redirecting to your opportunity.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // checking / importing
  return (
    <div {...wrapperProps} className="rounded-md border border-border bg-card px-4 py-3 text-sm" role="status">
      <div className="flex items-start gap-2">
        <Download className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <div>
          <div className="font-medium">
            {status === "checking" ? "Preparing import" : "Importing"}
          </div>
          <div className="mt-1 text-muted-foreground">
            {status === "checking"
              ? "Checking for a saved opportunity."
              : "Saving the opportunity into your workspace."}
          </div>
        </div>
      </div>
    </div>
  );
}
