"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/public/SearchInput";
import { ResultCard } from "@/components/public/ResultCard";
import { PreviewModal } from "@/components/public/PreviewModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonVariants } from "@/components/ui/button";
import { writePendingImport } from "@/features/search/pendingImport";
import type { NormalizedResult } from "@/types/search";

export function SearchSurface() {
  const router = useRouter();
  const clearSelectionTimerRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NormalizedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<NormalizedResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function runSearch(trimmedQuery: string) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(false);
    setResults([]);

    try {
      const res = await fetch("/api/search/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmedQuery }),
        signal: controller.signal,
      });

      const json: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          typeof json === "object" &&
          json !== null &&
          "error" in json &&
          typeof (json as { error?: unknown }).error === "object" &&
          (json as { error?: { message?: unknown } }).error !== null &&
          typeof (json as { error?: { message?: unknown } }).error?.message ===
            "string"
            ? (json as { error: { message: string } }).error.message
            : "Search failed. Please try again.";

        setErrorMessage(message);
        setHasSearched(true);
        return;
      }

      const resultsValue =
        typeof json === "object" &&
        json !== null &&
        "results" in json &&
        Array.isArray((json as { results?: unknown }).results)
          ? ((json as { results: unknown[] }).results as NormalizedResult[])
          : [];

      setResults(resultsValue);
      setHasSearched(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setErrorMessage("Search failed. Please try again.");
      setHasSearched(true);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsLoading(false);
    }
  }

  function handleQueryChange(next: string) {
    setQuery(next);

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = next.trim();
    if (trimmed.length < 3) {
      if (abortControllerRef.current) abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setHasSearched(false);
      setErrorMessage(null);
      setResults([]);
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      void runSearch(trimmed);
    }, 500);
  }

  function handleRetry() {
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    void runSearch(trimmed);
  }

  function handleViewDetails(result: NormalizedResult) {
    if (clearSelectionTimerRef.current !== null) {
      window.clearTimeout(clearSelectionTimerRef.current);
      clearSelectionTimerRef.current = null;
    }

    setSelectedResult(result);
    setModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    setModalOpen(open);
    // Clear selected result after close so the dialog exit animation can complete
    // while content remains visible.
    if (!open) {
      if (clearSelectionTimerRef.current !== null) {
        window.clearTimeout(clearSelectionTimerRef.current);
      }

      clearSelectionTimerRef.current = window.setTimeout(() => {
        setSelectedResult(null);
        clearSelectionTimerRef.current = null;
      }, 160);
    }
  }

  function handleSave(result: NormalizedResult) {
    writePendingImport(result);
    router.push("/login?next=/app/opportunities/import");
  }

  const showInitialState = query.trim().length < 3 && !hasSearched;
  const showLoadingState =
    query.trim().length >= 3 && isLoading && results.length === 0 && !errorMessage;
  const showNoResults = query.trim().length >= 3 && hasSearched && results.length === 0 && !errorMessage;

  return (
    <div className="flex flex-col gap-6">
      <SearchInput value={query} onChange={handleQueryChange} isLoading={isLoading} />

      {errorMessage && (
        <div
          role="status"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <div className="font-medium">Search unavailable</div>
          <div className="mt-0.5 text-destructive/90">{errorMessage}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className={buttonVariants({ variant: "outline", size: "sm" })}
              onClick={handleRetry}
            >
              Try again
            </button>
            <Link
              href="/login?next=/app/opportunities"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Add manually after sign in
            </Link>
          </div>
        </div>
      )}

      {showInitialState ? (
        <EmptyState
          icon={Search}
          title="Start searching"
          description="Enter a query to find internships, graduate programs, and early-career roles."
        />
      ) : showLoadingState ? (
        <EmptyState
          icon={Search}
          title="Searching"
          description="Looking up roles across the web."
        />
      ) : showNoResults ? (
        <EmptyState
          icon={Search}
          title="No results"
          description="Try a broader query or remove specific terms."
          action={
            <Link
              href="/login?next=/app/opportunities"
              className={buttonVariants({ variant: "outline" })}
            >
              Add an opportunity manually
            </Link>
          }
        />
      ) : (
        <div>
          {results.map((result) => (
            <ResultCard
              // Phase 08 deduplication ensures sourceUrl is unique per result set
              key={result.sourceUrl}
              result={result}
              onViewDetails={handleViewDetails}
              onSave={handleSave}
            />
          ))}
        </div>
      )}

      <PreviewModal
        result={selectedResult}
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        onSave={handleSave}
      />
    </div>
  );
}
