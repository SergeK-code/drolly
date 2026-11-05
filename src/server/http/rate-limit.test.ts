import { describe, expect, it } from "vitest";
import { AppError } from "@/server/http/api";
import {
  assertWithinRateLimit,
  createMemoryRateLimiter,
} from "@/server/http/rate-limit";

describe("createMemoryRateLimiter", () => {
  it("allows requests under the max and then blocks", () => {
    const limiter = createMemoryRateLimiter({ windowMs: 60_000, max: 2 });

    expect(limiter.consume("sign-in:1.1.1.1")).toEqual({ allowed: true });
    expect(limiter.consume("sign-in:1.1.1.1")).toEqual({ allowed: true });

    const blocked = limiter.consume("sign-in:1.1.1.1");
    expect(blocked.allowed).toBe(false);
    if (!blocked.allowed) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("throws a 429 AppError when the limit is exceeded", () => {
    const limiter = createMemoryRateLimiter({ windowMs: 60_000, max: 1 });
    assertWithinRateLimit(limiter, "register:test");

    expect(() => assertWithinRateLimit(limiter, "register:test")).toThrow(
      AppError,
    );

    try {
      assertWithinRateLimit(limiter, "register:test");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.status).toBe(429);
        expect(error.code).toBe("RATE_LIMITED");
      }
    }
  });
});
