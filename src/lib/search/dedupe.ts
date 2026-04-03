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

