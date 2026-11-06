import { parseApiResponse } from "@/lib/api";
import { sessionQueryKey } from "@/features/auth/api";
import { ordersQueryKey } from "@/features/orders/api";
import type { QueryClient } from "@tanstack/react-query";

export type AccountProfile = {
  email: string;
  fullName: string;
  phone: string | null;
  role: "customer" | "admin";
};

export const accountQueryKey = {
  all: ["account"] as const,
  profile: () => [...accountQueryKey.all, "profile"] as const,
};

export async function fetchProfile(): Promise<{ profile: AccountProfile }> {
  const response = await fetch("/api/account/profile", {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function updateProfile(input: {
  fullName: string;
  phone: string | null;
}): Promise<{ profile: AccountProfile }> {
  const response = await fetch("/api/account/profile", {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseApiResponse(response);
}

export async function updateAddress(
  id: string,
  input: {
    label?: string | null;
    recipientName: string;
    phone: string;
    addressLine: string;
    area: string;
    notes?: string | null;
    isDefault?: boolean;
  },
) {
  const response = await fetch(`/api/addresses/${id}`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseApiResponse<{ address: unknown }>(response);
}

export async function deleteAddress(id: string) {
  const response = await fetch(`/api/addresses/${id}`, {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  return parseApiResponse<{ deleted: boolean }>(response);
}

export async function invalidateAccountQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: accountQueryKey.all }),
    queryClient.invalidateQueries({ queryKey: sessionQueryKey }),
    queryClient.invalidateQueries({ queryKey: ordersQueryKey.addresses() }),
  ]);
}
