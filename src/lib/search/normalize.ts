import "server-only";

import type { NormalizedResult } from "@/types/search";

export const SEARCH_PROVIDER_LINKUP = "Linkup" as const;

export function normalizeResult(input: {
  title?: string;
  companyName?: string;
  location?: string;
  remoteMode?: string;
  opportunityType?: string;
  sourceUrl?: string;
  snippet?: string;
  postedDate?: string;
  confidence?: number;
  rawProviderPayload?: unknown;
}): NormalizedResult {
  return {
    title: (input.title ?? "").trim(),
    companyName: (input.companyName ?? "").trim(),
    location: (input.location ?? "Unknown").trim(),
    remoteMode: input.remoteMode?.trim() || undefined,
    opportunityType: input.opportunityType?.trim() || undefined,
    sourceUrl: (input.sourceUrl ?? "").trim(),
    sourceProvider: SEARCH_PROVIDER_LINKUP,
    snippet: (input.snippet ?? "").trim(),
    postedDate: input.postedDate?.trim() || undefined,
    confidence: typeof input.confidence === "number" ? input.confidence : undefined,
    rawProviderPayload: input.rawProviderPayload,
  };
}

export function normalizeResults(
  items: Array<{
    title?: string;
    companyName?: string;
    location?: string;
    remoteMode?: string;
    opportunityType?: string;
    sourceUrl?: string;
    snippet?: string;
    postedDate?: string;
    confidence?: number;
  }>,
  rawProviderPayload: unknown
): NormalizedResult[] {
  return items.map((item) =>
    normalizeResult({
      ...item,
      rawProviderPayload: { item, provider: rawProviderPayload },
    })
  );
}

