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

type ErrorPayload = {
  success?: unknown;
  error?: {
    code?: string;
    message?: string;
    details?: { fieldErrors?: Record<string, string[]> };
  };
  data?: unknown;
};

export async function parseApiResponse<T>(response: Response): Promise<T> {
  let payload: ErrorPayload;

  try {
    payload = (await response.json()) as ErrorPayload;
  } catch {
    throw new ApiError("The request failed.");
  }

  if (payload.success !== true) {
    throw new ApiError(payload.error?.message ?? "The request failed.", {
      code: payload.error?.code,
      fieldErrors: payload.error?.details?.fieldErrors,
    });
  }

  return payload.data as T;
}
