import { NextResponse } from "next/server";
import { AppError } from "@/server/errors/app-error";
import { formatApiError } from "@/server/errors/format-api-error";
import { jsonError } from "@/server/http/json";
import { logger, safeErrorContext } from "@/server/logging/logger";

export function handleApiError(
  error: unknown,
  requestId: string,
): NextResponse {
  const formatted = formatApiError(error, requestId);

  if (formatted.status >= 500) {
    logger.error(
      { requestId, err: safeErrorContext(error) },
      "Unexpected API error",
    );
  } else if (error instanceof AppError) {
    logger.warn(
      { requestId, code: error.code, status: error.status },
      "Request rejected",
    );
  }

  return jsonError(formatted.body, formatted.status, requestId);
}
