import type { NormalizedResult } from "@/types/search";

export function extractErrorMessageFromJson(
  json: unknown,
  fallback: string
): string {
  return typeof json === "object" &&
    json !== null &&
    "error" in json &&
    typeof (json as { error?: unknown }).error === "object" &&
    (json as { error?: { message?: unknown } }).error !== null &&
    typeof (json as { error?: { message?: unknown } }).error?.message === "string"
    ? (json as { error: { message: string } }).error.message
    : fallback;
}

export function extractSearchResultsFromJson(json: unknown): NormalizedResult[] {
  return typeof json === "object" &&
    json !== null &&
    "results" in json &&
    Array.isArray((json as { results?: unknown }).results)
    ? ((json as { results: unknown[] }).results as NormalizedResult[])
    : [];
}

export function extractOpportunityIdFromJson(json: unknown): string | null {
  return typeof json === "object" &&
    json !== null &&
    "opportunityId" in json &&
    typeof (json as { opportunityId?: unknown }).opportunityId === "string"
    ? (json as { opportunityId: string }).opportunityId
    : null;
}

