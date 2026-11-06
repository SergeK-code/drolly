import {
  flattenFieldErrors,
  messageFromFieldErrors,
  type FieldErrors,
} from "@/lib/zod-fields";

export class ApiError extends Error {
  code?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    options?: { code?: string; fieldErrors?: Record<string, string[]> },
  ) {
    super(message);
    this.name = "ApiError";
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
  }
}

type ApiPayload = {
  success?: unknown;
  data?: unknown;
  error?: {
    code?: string;
    message?: string;
    fieldErrors?: Record<string, string[]>;
  };
};

export async function parseApiResponse<T>(response: Response): Promise<T> {
  let payload: ApiPayload;

  try {
    payload = (await response.json()) as ApiPayload;
  } catch {
    throw new ApiError("The request failed.");
  }

  if (payload.success === true) {
    return payload.data as T;
  }

  throw new ApiError(payload.error?.message ?? "The request failed.", {
    code: payload.error?.code,
    fieldErrors: payload.error?.fieldErrors,
  });
}

export function explainApiError(error: unknown): {
  fieldErrors: FieldErrors;
  message: string;
} {
  if (error instanceof ApiError) {
    const fieldErrors = flattenFieldErrors(error.fieldErrors ?? {});

    if (error.code === "UNAUTHENTICATED" && !fieldErrors.password) {
      fieldErrors.password = ["Invalid email or password."];
    }

    if (error.code === "UNAUTHENTICATED") {
      return { fieldErrors, message: "Invalid email or password." };
    }

    const message =
      Object.keys(fieldErrors).length > 0
        ? messageFromFieldErrors(fieldErrors)
        : error.message;

    return { fieldErrors, message };
  }

  return {
    fieldErrors: {},
    message: error instanceof Error ? error.message : "The request failed.",
  };
}
