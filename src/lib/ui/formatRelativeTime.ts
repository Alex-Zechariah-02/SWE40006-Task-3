/**
 * Format a date/ISO string as a human-friendly relative time.
 *
 * Hierarchy:
 * - < 1 minute: "Just now"
 * - < 60 minutes: "X minutes ago"
 * - < 24 hours: "X hours ago"
 * - < 7 days: "X days ago"
 * - < 30 days: "X weeks ago"
 * - Same year: "Mar 15"
 * - Different year: "Mar 15, 2023"
 */
export function formatRelativeTime(input: string | Date): string {
  const now = new Date();
  const then = input instanceof Date ? input : new Date(input);
  const diffMs = now.getTime() - then.getTime();

  if (diffMs < 0) {
    // Future dates: show absolute
    return formatShortDate(then);
  }

  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;

  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;

  return formatShortDate(then);
}

/**
 * Format a date as an absolute short date.
 * - Same year: "15 Mar"
 * - Different year: "15 Mar 2023"
 *
 * Pass `includeYear: true` to always include the year.
 */
export function formatShortDate(
  input: string | Date,
  opts?: { includeYear?: boolean },
): string {
  if (!input) return "No date";
  const date = input instanceof Date ? input : new Date(input);
  const now = new Date();
  const showYear = opts?.includeYear || date.getFullYear() !== now.getFullYear();
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(showYear ? { year: "numeric" } : {}),
  });
}

/**
 * Format a time as HH:MM (24-hour, en-GB).
 */
export function formatTime(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
