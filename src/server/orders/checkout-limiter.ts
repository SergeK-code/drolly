import { createMemoryRateLimiter } from "@/server/http/rate-limit";

export const checkoutRateLimiter = createMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

export const customerOrderRateLimiter = createMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});
