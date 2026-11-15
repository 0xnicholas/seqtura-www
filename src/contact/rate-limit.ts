export interface RateLimitDecision {
  readonly allowed: boolean;
  readonly retryAfterSeconds?: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitDecision;
}

export const defaultRateLimitWindowMs = 60 * 60 * 1000;
export const defaultLiveRateLimit = 5;

export function createMemoryRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key, now = Date.now()) {
      const cutoff = now - windowMs;
      const recent = (hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);

      if (recent.length >= limit) {
        const oldest = recent[0] ?? now;
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
        };
      }

      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000) {
        for (const [storedKey, timestamps] of hits) {
          if (timestamps.every((timestamp) => timestamp <= cutoff)) hits.delete(storedKey);
        }
      }

      return { allowed: true };
    },
  };
}

function positiveNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function resolveRateLimiter(
  env: Record<string, string | undefined>,
  mode: 'live' | 'test' | 'off',
): RateLimiter | undefined {
  const configuredLimit = positiveNumber(env.CONTACT_RATE_LIMIT_MAX);
  const limit = configuredLimit ?? (mode === 'live' ? defaultLiveRateLimit : undefined);
  if (!limit) return undefined;

  const windowMs =
    positiveNumber(env.CONTACT_RATE_LIMIT_WINDOW_MS) ?? defaultRateLimitWindowMs;
  return createMemoryRateLimiter(limit, windowMs);
}
