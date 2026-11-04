import type { NextResponse } from "next/server";
import { handleApiError } from "@/server/http/handle-api-error";
import { getRequestId } from "@/server/http/request-id";
import { logger } from "@/server/logging/logger";

type ApiContext = {
  request: Request;
  requestId: string;
};

export function apiHandler(
  handler: (context: ApiContext) => Promise<NextResponse>,
) {
  return async (request: Request): Promise<NextResponse> => {
    const requestId = getRequestId(request);
    const startedAt = Date.now();
    const path = new URL(request.url).pathname;

    try {
      const response = await handler({ request, requestId });
      response.headers.set("x-request-id", requestId);

      logger.info(
        {
          requestId,
          method: request.method,
          path,
          statusCode: response.status,
          durationMs: Date.now() - startedAt,
        },
        "API request completed",
      );

      return response;
    } catch (error) {
      const response = handleApiError(error, requestId);

      logger.info(
        {
          requestId,
          method: request.method,
          path,
          statusCode: response.status,
          durationMs: Date.now() - startedAt,
        },
        "API request failed",
      );

      return response;
    }
  };
}
