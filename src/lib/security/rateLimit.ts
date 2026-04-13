import "server-only";

type RateState = {
  tokens: number;
  updatedAt: number;
  lastSeenAt: number;
};

export type TokenBucketOptions = {
  capacity: number;
  refillMs: number;
  maxEntries: number;
  evictOlderThanMs: number;
};

type LimiterStore = {
  careerDeckRateLimiters?: Record<string, Map<string, RateState>>;
};

function getLimiterStore(): LimiterStore {
  return globalThis as unknown as LimiterStore;
}

function getLimiterMap(key: string): Map<string, RateState> {
  const store = getLimiterStore();
  if (!store.careerDeckRateLimiters) store.careerDeckRateLimiters = {};
  if (!store.careerDeckRateLimiters[key]) store.careerDeckRateLimiters[key] = new Map();
  return store.careerDeckRateLimiters[key];
}

export function createTokenBucketLimiter(key: string, options: TokenBucketOptions) {
  const map = getLimiterMap(key);

  function allow(id: string): boolean {
    const now = Date.now();
    const existing = map.get(id);

    if (!existing) {
      map.set(id, { tokens: options.capacity - 1, updatedAt: now, lastSeenAt: now });
    } else {
      const elapsed = Math.max(0, now - existing.updatedAt);
      const refills = Math.floor(elapsed / options.refillMs);
      const newTokens = Math.min(options.capacity, existing.tokens + refills);

      if (newTokens < 1) {
        existing.lastSeenAt = now;
        existing.tokens = newTokens;
        map.set(id, existing);
        return false;
      }

      existing.tokens = newTokens - 1;
      existing.updatedAt = now;
      existing.lastSeenAt = now;
      map.set(id, existing);
    }

    if (map.size > options.maxEntries) {
      for (const [k, v] of map) {
        if (now - v.lastSeenAt > options.evictOlderThanMs) map.delete(k);
        if (map.size <= options.maxEntries) break;
      }
    }

    return true;
  }

  return { allow };
}

