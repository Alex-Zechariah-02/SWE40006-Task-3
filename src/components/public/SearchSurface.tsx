"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { SearchInput } from "@/components/public/SearchInput";
import { ResultCard } from "@/components/public/ResultCard";
import { PreviewModal } from "@/components/public/PreviewModal";
import { EmptyState } from "@/components/shared/EmptyState";
import type { NormalizedResult } from "@/types/search";

export function SearchSurface() {
  const [query, setQuery] = useState("");
  // Phase 08: wire setResults via the /api/search/opportunities fetch with 500ms debounce
  const [results, setResults] = useState<NormalizedResult[]>([]);
  // Phase 08: wire setIsLoading around the fetch lifecycle
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState<NormalizedResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Suppress unused-variable hints until Phase 08 wires the fetch
  void setResults;
  void setIsLoading;

  function handleViewDetails(result: NormalizedResult) {
    setSelectedResult(result);
    setModalOpen(true);
  }

  function handleModalOpenChange(open: boolean) {
    setModalOpen(open);
    // Clear selected result after close so next open starts fresh.
    // PreviewModal caches the last result internally to allow the exit animation
    // to complete with content visible before this null propagates.
    if (!open) setSelectedResult(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchInput value={query} onChange={setQuery} isLoading={isLoading} />

      {results.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Start searching"
          description="Enter a query to find internships, graduate programs, and early-career roles."
        />
      ) : (
        <div>
          {results.map((result) => (
            <ResultCard
              // Phase 08 deduplication ensures sourceUrl is unique per result set
              key={result.sourceUrl}
              result={result}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      <PreviewModal
        result={selectedResult}
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
      />
    </div>
  );
}
