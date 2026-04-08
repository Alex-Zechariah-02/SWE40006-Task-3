"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/public/SearchInput";
import { ResultCard } from "@/components/public/ResultCard";
import { PreviewModal } from "@/components/public/PreviewModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { writePendingImport } from "@/features/search/pendingImport";
import type { NormalizedResult } from "@/types/search";

export function SearchSurface({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const clearSelectionTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const didAutostartRef = useRef(false);

  const [query, setQuery] = useState(initialQuery ?? "");
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string | null>(null);
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

    setLastSearchedQuery(trimmedQuery);
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
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    void runSearch(trimmed);
  }

  function handleRetry() {
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
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

  async function handleSave(result: NormalizedResult) {
    // If already signed in, import immediately; otherwise fall back to the
    // pending-import handoff flow (used by the required Phase 13 E2E path).
    try {
      const res = await fetch("/api/opportunities/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      });

      const json: unknown = await res.json().catch(() => null);

      if (res.status === 401) {
        writePendingImport(result);
        router.push("/login?next=/app/opportunities/import");
        return;
      }

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
            : "Import failed. Please try again.";
        setErrorMessage(message);
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
        setErrorMessage("Import failed. Please try again.");
        return;
      }

      router.push(`/app/opportunities/${opportunityId}`);
    } catch {
      setErrorMessage("Import failed. Please try again.");
    }
  }

  const showInitialState =
    !hasSearched && !isLoading && results.length === 0 && !errorMessage;
  const showLoadingState = isLoading && results.length === 0 && !errorMessage;
  const showNoResults =
    query.trim().length >= 3 && hasSearched && results.length === 0 && !errorMessage;

  useEffect(() => {
    if (didAutostartRef.current) return;
    didAutostartRef.current = true;

    const trimmed = (initialQuery ?? "").trim();
    if (trimmed.length < 3) return;
    setLastSearchedQuery(trimmed);
    void runSearch(trimmed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 3;
  const hasDirtyQuery =
    canSearch && trimmedQuery !== (lastSearchedQuery ?? "");

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 sm:flex-row sm:items-center"
          data-testid="search-form"
        >
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={handleQueryChange}
              isLoading={isLoading}
            />
          </div>
          <Button
            type="submit"
            className="h-11 sm:px-5"
            disabled={!canSearch || isLoading}
          >
            Search
          </Button>
        </form>

        {hasDirtyQuery && !isLoading && (
          <p className="type-small text-muted-foreground">
            Press Enter or click Search to run your query.
          </p>
        )}
      </div>

      {errorMessage && (
        <div
          role="status"
          data-testid="search-error"
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
          title={canSearch ? "Ready to search" : "Start searching"}
          description={
            canSearch
              ? "Press Enter or click Search to fetch results."
              : "Enter a query to find internships, graduate programs, and early-career roles."
          }
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
        <div data-testid="search-results">
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
