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
