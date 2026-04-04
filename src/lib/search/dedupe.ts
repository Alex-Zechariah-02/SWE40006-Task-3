import "server-only";

export function canonicalizeUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return input.trim();
  }

  url.hash = "";

  const toDelete: string[] = [];
  url.searchParams.forEach((_, key) => {
    if (key.toLowerCase().startsWith("utm_")) toDelete.push(key);
  });
  for (const key of toDelete) url.searchParams.delete(key);

  const normalizedPath = url.pathname.replace(/\/+$/, "");
  url.pathname = normalizedPath.length === 0 ? "/" : normalizedPath;

  return url.toString();
}

export function computeDedupeKey(params: {
  provider: string;
  canonicalUrl: string;
}): string {
  return `${params.provider.toLowerCase()}:${params.canonicalUrl}`;
}

/**
 * Dedupe key for manual opportunities that have no source URL.
 * Uses a hash of normalized title + company + location + type.
 */
export function computeManualDedupeKey(params: {
  title: string;
  companyName: string;
  location: string;
  opportunityType: string;
}): string {
  const normalized = [
    params.title.trim().toLowerCase(),
    params.companyName.trim().toLowerCase(),
    (params.location || "").trim().toLowerCase(),
    params.opportunityType.trim().toLowerCase(),
  ].join("|");

  // Simple hash for deduplication (not cryptographic)
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  const hex = (hash >>> 0).toString(16).padStart(8, "0");
  return `manual:${hex}`;
}

