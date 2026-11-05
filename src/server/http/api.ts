import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestId } from "@/server/http/request-id";
import { logger, safeErrorContext } from "@/server/logging/logger";

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(
    code: string,
    status: number,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
};

export function jsonSuccess<T>(
  data: T,
  options: { status?: number; requestId: string },
): NextResponse {
  return NextResponse.json(
    { success: true as const, data },
    {
      status: options.status ?? 200,
      headers: { "x-request-id": options.requestId },
    },
  );
}

const PUBLIC_STATUS_MESSAGES: Record<number, string> = {
  400: "The submitted data is invalid.",
  401: "Sign in to continue.",
  403: "You do not have permission to do this.",
  404: "The requested resource was not found.",
  409: "This value is already used.",
  429: "Too many requests. Try again later.",
  500: "An unexpected error occurred.",
};

export function formatApiError(
  error: unknown,
  requestId: string,
): { status: number; body: ApiErrorBody } {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        success: false,
        error: {
          code: error.code,
          message:
            PUBLIC_STATUS_MESSAGES[error.status] ??
            "An unexpected error occurred.",
          details: error.details,
          requestId,
        },
      },
    };
  }

  if (error instanceof z.ZodError) {
    return {
      status: 400,
      body: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The submitted data is invalid.",
          details: { fieldErrors: fieldErrorsFromZod(error) },
          requestId,
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
        requestId,
      },
    },
  };
}

export function apiHandler(
  handler: (context: {
    request: Request;
    requestId: string;
  }) => Promise<NextResponse>,
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
      const formatted = formatApiError(error, requestId);
      const message = formatted.body.error.message;

      if (formatted.status >= 500) {
        logger.error(
          { requestId, err: safeErrorContext(error), message },
          message,
        );
      } else {
        logger.warn(
          {
            requestId,
            code: formatted.body.error.code,
            status: formatted.status,
            message,
            err: safeErrorContext(error),
          },
          message,
        );
      }

      const response = NextResponse.json(formatted.body, {
        status: formatted.status,
        headers: { "x-request-id": requestId },
      });

      logger.info(
        {
          requestId,
          method: request.method,
          path,
          statusCode: response.status,
          durationMs: Date.now() - startedAt,
          message,
        },
        "API request failed",
      );

      return response;
    }
  };
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_root";
    const messages = fieldErrors[path] ?? [];
    messages.push(issue.message);
    fieldErrors[path] = messages;
  }

  return fieldErrors;
}
