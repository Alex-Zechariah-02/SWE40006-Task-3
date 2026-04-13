"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { writePendingImport } from "@/features/search/pendingImport";
import type { NormalizedResult } from "@/types/search";
import {
  extractErrorMessageFromJson,
  extractOpportunityIdFromJson,
  extractSearchResultsFromJson,
} from "./parse";

export function useSearchController(params: { initialQuery?: string }) {
  const router = useRouter();
  const clearSelectionTimerRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const didAutostartRef = useRef(false);

  const [query, setQuery] = useState(params.initialQuery ?? "");
  const [lastSearchedQuery, setLastSearchedQuery] = useState<string | null>(null);
  const [results, setResults] = useState<NormalizedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<NormalizedResult | null>(
    null
  );
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
        setErrorMessage(
          extractErrorMessageFromJson(json, "Search failed. Please try again.")
        );
        setHasSearched(true);
        return;
      }

      setResults(extractSearchResultsFromJson(json));
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
        setErrorMessage(
          extractErrorMessageFromJson(json, "Import failed. Please try again.")
        );
        return;
      }

      const opportunityId = extractOpportunityIdFromJson(json);
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

    const trimmed = (params.initialQuery ?? "").trim();
    if (trimmed.length < 3) return;
    setLastSearchedQuery(trimmed);
    void runSearch(trimmed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= 3;
  const hasDirtyQuery = canSearch && trimmedQuery !== (lastSearchedQuery ?? "");

  return {
    query,
    isLoading,
    results,
    hasSearched,
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
  };
}

