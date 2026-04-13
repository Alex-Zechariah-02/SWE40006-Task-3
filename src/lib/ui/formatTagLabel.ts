const ACRONYMS = new Set(["AI", "ML", "UI", "UX", "QA", "API", "SQL", "IT"]);

const SPECIAL_CASES: Record<string, string> = {
  devops: "DevOps",
};

function formatSegment(segment: string): string {
  if (!segment) return segment;

  const lower = segment.toLowerCase();
  if (SPECIAL_CASES[lower]) {
    return SPECIAL_CASES[lower];
  }

  const upper = segment.toUpperCase();
  if (ACRONYMS.has(upper)) {
    return upper;
  }

  return `${segment.charAt(0).toUpperCase()}${segment.slice(1).toLowerCase()}`;
}

export function formatTagLabel(tag: string): string {
  if (!tag) return "";

  const normalized = tag.replace(/_/g, " ").trim();
  if (!normalized) return "";

  return normalized
    .split(/\s+/)
    .map((token) => token.split("-").map(formatSegment).join("-"))
    .join(" ");
}
