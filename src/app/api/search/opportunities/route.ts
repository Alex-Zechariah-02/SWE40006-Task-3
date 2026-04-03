import { NextResponse } from "next/server";
import { z } from "zod";

import { LinkupError, linkupStructuredSearch } from "@/lib/search/linkup";
import { canonicalizeUrl } from "@/lib/search/dedupe";
import { normalizeResults } from "@/lib/search/normalize";

export const runtime = "nodejs";

const requestSchema = z.object({
  query: z.string().trim().min(3).max(120),
});

type RateState = {
  tokens: number;
  updatedAt: number;
  lastSeenAt: number;
};

const RATE_LIMIT_CAPACITY = 3;
const RATE_LIMIT_REFILL_MS = 2000;
const RATE_LIMIT_MAX_ENTRIES = 800;
const RATE_LIMIT_EVICT_OLDER_THAN_MS = 20 * 60 * 1000;

const globalForRateLimit = globalThis as unknown as {
  careerDeckSearchRateLimit?: Map<string, RateState>;
};

function getRateLimitMap(): Map<string, RateState> {
  if (!globalForRateLimit.careerDeckSearchRateLimit) {
    globalForRateLimit.careerDeckSearchRateLimit = new Map();
  }
  return globalForRateLimit.careerDeckSearchRateLimit;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  return "unknown";
}

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const map = getRateLimitMap();
  const existing = map.get(ip);

  if (!existing) {
    map.set(ip, { tokens: RATE_LIMIT_CAPACITY - 1, updatedAt: now, lastSeenAt: now });
  } else {
    const elapsed = Math.max(0, now - existing.updatedAt);
    const refills = Math.floor(elapsed / RATE_LIMIT_REFILL_MS);
    const newTokens = Math.min(
      RATE_LIMIT_CAPACITY,
      existing.tokens + refills
    );

    if (newTokens < 1) {
      existing.lastSeenAt = now;
      existing.tokens = newTokens;
      map.set(ip, existing);
      return false;
    }

    existing.tokens = newTokens - 1;
    existing.updatedAt = now;
    existing.lastSeenAt = now;
    map.set(ip, existing);
  }

  if (map.size > RATE_LIMIT_MAX_ENTRIES) {
    for (const [key, value] of map) {
      if (now - value.lastSeenAt > RATE_LIMIT_EVICT_OLDER_THAN_MS) map.delete(key);
      if (map.size <= RATE_LIMIT_MAX_ENTRIES) break;
    }
  }

  return true;
}

function enrichQuery(query: string): string {
  const trimmed = query.trim();
  const hasJobIntent = /(job|role|intern|internship|graduate|hiring|apply)/i.test(
    trimmed
  );

  const base = hasJobIntent
    ? trimmed
    : `${trimmed} internships or graduate roles`;

  const hasCountryHint = /\bmalaysia\b/i.test(base);
  return hasCountryHint ? base : `${base} Malaysia`;
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  if (!allowRequest(ip)) {
    return NextResponse.json(
      { error: { message: "Too many searches. Please wait a moment and try again." } },
      { status: 429 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { message: "Search queries must be 3 to 120 characters." } },
      { status: 400 }
    );
  }

  const enriched = enrichQuery(parsed.data.query);

  try {
    const response = await linkupStructuredSearch({ q: enriched, maxResults: 8 });

    const normalized = normalizeResults(response.results, {
      provider: "Linkup",
      query: enriched,
    }).map((r) => ({ ...r, sourceUrl: canonicalizeUrl(r.sourceUrl) }));

    const seen = new Set<string>();
    const deduped = normalized.filter((r) => {
      if (!r.sourceUrl) return false;
      if (seen.has(r.sourceUrl)) return false;
      seen.add(r.sourceUrl);
      return true;
    });

    return NextResponse.json({ results: deduped.slice(0, 8) });
  } catch (error) {
    const status =
      error instanceof LinkupError && typeof error.status === "number"
        ? error.status
        : 502;

    const message =
      status === 401
        ? "Search is temporarily unavailable."
        : status === 429
          ? "Search is temporarily busy. Please wait a moment and try again."
          : "Search failed. Please try again.";

    const httpStatus = status === 429 ? 429 : 502;
    return NextResponse.json({ error: { message } }, { status: httpStatus });
  }
}
