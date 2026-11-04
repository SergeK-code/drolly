type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: { fieldErrors?: Record<string, string[]> };
  };
};

type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
};

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!("success" in payload) || payload.success !== true) {
    const error = new Error(
      payload && "error" in payload
        ? payload.error.message
        : "The request failed.",
    );
    Object.assign(error, {
      fieldErrors:
        payload && "error" in payload
          ? payload.error.details?.fieldErrors
          : undefined,
    });
    throw error;
  }

  return payload.data;
}

export async function registerAccount(input: {
  fullName: string;
  email: string;
  password: string;
}) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<{
    user: PublicUser | null;
    confirmationRequired: boolean;
  }>(response);
}

export async function signInAccount(input: { email: string; password: string }) {
  const response = await fetch("/api/auth/sign-in", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseResponse<{ user: PublicUser | null }>(response);
}

export async function signOutAccount() {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: "{}",
  });

  return parseResponse<{ signedOut: boolean }>(response);
}
