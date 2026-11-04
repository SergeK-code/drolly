import "server-only";

import { z } from "zod";
import { AppError } from "@/server/errors/app-error";
import { logger } from "@/server/logging/logger";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().min(1).default("http://localhost:3000"),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) {
    return cached;
  }

  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
    LOG_LEVEL: process.env.LOG_LEVEL,
  });

  if (!parsed.success) {
    logger.error(
      {
        fields: parsed.error.issues.map((issue) => issue.path.join(".")),
      },
      "Invalid environment configuration",
    );

    throw new AppError(
      "CONFIGURATION_ERROR",
      500,
      "The service is temporarily unavailable.",
    );
  }

  try {
    new URL(parsed.data.NEXT_PUBLIC_APP_URL);
    new URL(parsed.data.SUPABASE_URL);
  } catch {
    throw new AppError(
      "CONFIGURATION_ERROR",
      500,
      "The service is temporarily unavailable.",
    );
  }

  cached = parsed.data;
  return cached;
}

export function resetEnvCache(): void {
  cached = undefined;
}
