import { rateLimited } from "@/server/http/api";

/**
 * In-memory rate limiter for local development and a single Node process.
 *
 * This is not production-distributed: counts reset on restart and are not
 * shared across multiple instances. For deployment, use a shared store or
 * platform-level limiting. Do not add Redis only for the MVP.
 */

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export type RateLimiter = {
  consume: (key: string) => RateLimitResult;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export function createMemoryRateLimiter(options: {
  windowMs: number;
  max: number;
}): RateLimiter {
  const buckets = new Map<string, Bucket>();

  return {
    consume(key: string): RateLimitResult {
      const now = Date.now();
      const existing = buckets.get(key);

      if (!existing || existing.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true };
      }

      if (existing.count >= options.max) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(
            1,
            Math.ceil((existing.resetAt - now) / 1000),
          ),
        };
      }

      existing.count += 1;
      return { allowed: true };
    },
  };
}

export function assertWithinRateLimit(
  limiter: RateLimiter,
  key: string,
): void {
  const result = limiter.consume(key);

  if (!result.allowed) {
    throw rateLimited();
  }
}
