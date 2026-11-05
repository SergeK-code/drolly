import { AppError } from "@/server/http/api";
import { logger, safeErrorContext } from "@/server/logging/logger";
import { assertStoreSettingsReadable } from "@/server/repositories/health-repository";

export type HealthStatus = "ok" | "degraded";

export type HealthResult = {
  status: HealthStatus;
};

export async function getHealth(): Promise<HealthResult> {
  try {
    await assertStoreSettingsReadable();
    return { status: "ok" };
  } catch (error) {
    if (
      error instanceof AppError &&
      (error.code === "DATABASE_ERROR" ||
        error.code === "CONFIGURATION_ERROR")
    ) {
      logger.warn(
        { err: safeErrorContext(error) },
        "Health check could not reach the database",
      );
      return { status: "degraded" };
    }

    throw error;
  }
}
