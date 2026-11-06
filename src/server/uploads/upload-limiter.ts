import { createMemoryRateLimiter } from "@/server/http/rate-limit";

export const uploadRateLimiter = createMemoryRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});
