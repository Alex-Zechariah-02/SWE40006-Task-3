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

export function computeDedupeKey(params: { provider: string; canonicalUrl: string }): string {
  return `${params.provider.toLowerCase()}:${params.canonicalUrl}`;
}

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

  let hashValue = 0;
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    hashValue = ((hashValue << 5) - hashValue + ch) | 0;
  }
  const hex = (hashValue >>> 0).toString(16).padStart(8, "0");
  return `manual:${hex}`;
}

export function dateUtcNoon(year: number, month1: number, day: number): Date {
  return new Date(Date.UTC(year, month1 - 1, day, 12, 0, 0));
}

export function kualaLumpurTime(isoLocalWithOffset: string): Date {
  return new Date(isoLocalWithOffset);
}

