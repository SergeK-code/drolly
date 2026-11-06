import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestId } from "@/server/http/request-id";
import { logger, safeErrorContext } from "@/server/logging/logger";

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: string,
    status: number,
    message: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
    fieldErrors?: Record<string, string[]>;
  };
};

function jsonResponse(
  body: unknown,
  status: number,
  requestId: string,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "x-request-id": requestId },
  });
}

export function jsonSuccess<T>(
  data: T,
  options: { status?: number; requestId: string },
): NextResponse {
  return jsonResponse(
    { success: true as const, data },
    options.status ?? 200,
    options.requestId,
  );
}

const PUBLIC_STATUS_MESSAGES: Record<number, string> = {
  400: "The submitted data is invalid.",
  401: "Sign in to continue.",
  403: "You do not have permission to do this.",
  404: "The requested resource was not found.",
  409: "This value is already used.",
  422: "Validation failed",
  429: "Too many requests. Try again later.",
  500: "An unexpected error occurred.",
};

export function notFound(
  message = "The requested resource was not found.",
): AppError {
  return new AppError("NOT_FOUND", 404, message);
}

export function conflict(
  message = "This value is already used.",
  fieldErrors?: Record<string, string[]>,
): AppError {
  return new AppError("CONFLICT", 409, message, fieldErrors);
}

export function unauthenticated(message = "Sign in to continue."): AppError {
  return new AppError("UNAUTHENTICATED", 401, message);
}

export function forbidden(
  message = "You do not have permission to do this.",
): AppError {
  return new AppError("FORBIDDEN", 403, message);
}

export function validationFailed(
  fieldErrors: Record<string, string[]>,
): AppError {
  return new AppError("VALIDATION_ERROR", 422, "Validation failed", fieldErrors);
}

export function rateLimited(): AppError {
  return new AppError(
    "RATE_LIMITED",
    429,
    "Too many requests. Please try again later.",
  );
}

export function serviceUnavailable(
  code = "DATABASE_ERROR",
): AppError {
  return new AppError(code, 500, "The service is temporarily unavailable.");
}

export function validateData<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw validationFailed(fieldErrorsFromZod(result.error));
  }
  return result.data;
}

type ClassifiedError = {
  status: number;
  code: string;
  fieldErrors?: Record<string, string[]>;
};

function classifyApiError(error: unknown): ClassifiedError {
  if (error instanceof AppError) {
    return {
      status: error.status,
      code: error.code,
      fieldErrors: error.fieldErrors,
    };
  }

  if (error instanceof z.ZodError) {
    return {
      status: 422,
      code: "VALIDATION_ERROR",
      fieldErrors: fieldErrorsFromZod(error),
    };
  }

  return { status: 500, code: "INTERNAL_ERROR" };
}

function apiErrorResponse(
  error: unknown,
  requestId: string,
): { status: number; code: string; response: NextResponse } {
  const failure = classifyApiError(error);
  const body: ApiErrorBody = {
    success: false,
    error: {
      code: failure.code,
      message:
        PUBLIC_STATUS_MESSAGES[failure.status] ?? PUBLIC_STATUS_MESSAGES[500],
      requestId,
      ...(failure.fieldErrors && Object.keys(failure.fieldErrors).length > 0
        ? { fieldErrors: failure.fieldErrors }
        : {}),
    },
  };

  return {
    status: failure.status,
    code: failure.code,
    response: jsonResponse(body, failure.status, requestId),
  };
}

export function formatApiError(
  error: unknown,
  requestId: string,
): NextResponse {
  return apiErrorResponse(error, requestId).response;
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
      const formatted = apiErrorResponse(error, requestId);
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      const details = {
        requestId,
        code: formatted.code,
        status: formatted.status,
        message,
        err: safeErrorContext(error),
      };

      if (formatted.status >= 500) {
        logger.error(details, message);
      } else {
        logger.warn(details, message);
      }

      logger.info(
        {
          requestId,
          method: request.method,
          path,
          statusCode: formatted.status,
          durationMs: Date.now() - startedAt,
          message,
        },
        "API request failed",
      );

      return formatted.response;
    }
  };
}

function fieldErrorsFromZod(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    const messages = fieldErrors[field] ?? [];
    messages.push(issue.message);
    fieldErrors[field] = messages;
  }

  return fieldErrors;
}
