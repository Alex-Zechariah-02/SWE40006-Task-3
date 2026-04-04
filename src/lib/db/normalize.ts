/**
 * Shared company name normalization.
 * Used by both the import route and manual creation to ensure
 * the same company is never duplicated under different casings.
 */
export function normalizeCompanyName(value: string): {
  name: string;
  normalizedName: string;
} {
  const name = value.trim();
  const normalizedName = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return { name, normalizedName };
}
