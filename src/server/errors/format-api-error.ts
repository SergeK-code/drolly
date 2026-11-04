import { z } from "zod";
import { AppError } from "@/server/errors/app-error";

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
};

const PUBLIC_INTERNAL_MESSAGE = "An unexpected error occurred.";

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
          message: error.message,
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
        message: PUBLIC_INTERNAL_MESSAGE,
        requestId,
      },
    },
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
