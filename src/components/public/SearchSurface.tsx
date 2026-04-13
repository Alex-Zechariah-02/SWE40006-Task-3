"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/public/SearchInput";
import { ResultCard } from "@/components/public/ResultCard";
import { PreviewModal } from "@/components/public/PreviewModal";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSearchController } from "@/components/public/search/useSearchController";

export function SearchSurface({ initialQuery }: { initialQuery?: string }) {
  const {
    query,
    isLoading,
    results,
    errorMessage,
    selectedResult,
    modalOpen,
    showInitialState,
    showLoadingState,
    showNoResults,
    canSearch,
    hasDirtyQuery,
    handleQueryChange,
    handleSubmit,
    handleRetry,
    handleViewDetails,
    handleModalOpenChange,
    handleSave,
  } = useSearchController({ initialQuery });

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
            className="h-12 sm:px-6"
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
          <div className="mt-1 text-destructive/90">{errorMessage}</div>
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
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface-raised p-5 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : showNoResults ? (
        <EmptyState
          icon={Search}
          title="No results found"
          description="No results found. Try different keywords."
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
        <div data-testid="search-results" className="space-y-1">
          <p className="type-caption text-muted-foreground mb-2">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <div className="space-y-4">
            {results.map((result) => (
              <ResultCard
                key={result.sourceUrl}
                result={result}
                onViewDetails={handleViewDetails}
                onSave={handleSave}
              />
            ))}
          </div>
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
