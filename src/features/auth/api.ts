import { parseApiResponse } from "@/lib/api";

export type PublicUser = {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
};

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

  return parseApiResponse<{
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

  return parseApiResponse<{ user: PublicUser | null }>(response);
}

export const sessionQueryKey = ["auth", "session"] as const;

export async function fetchSession(): Promise<{ user: PublicUser | null }> {
  const response = await fetch("/api/auth/session", {
    credentials: "include",
  });

  return parseApiResponse(response);
}

export async function signOutAccount() {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: "{}",
  });

  return parseApiResponse<{ signedOut: boolean }>(response);
}
