import { parseApiResponse } from "@/lib/api";
import type { QueryClient } from "@tanstack/react-query";

export type PublicStoreSettings = {
  storeName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  currency: string;
  deliveryFeeMinor: number;
  minimumOrderMinor: number;
};

export type DashboardSummary = {
  categoryCount: number;
  productCount: number;
  orderCount: number;
  pendingOrderCount: number;
};

export const storeQueryKey = {
  all: ["store"] as const,
  public: () => [...storeQueryKey.all, "public"] as const,
  admin: () => [...storeQueryKey.all, "admin"] as const,
  dashboard: () => [...storeQueryKey.all, "dashboard"] as const,
};

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function fetchPublicStoreSettings(): Promise<{
  settings: PublicStoreSettings;
}> {
  const response = await fetch("/api/store-settings", {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function fetchAdminStoreSettings(): Promise<{
  settings: PublicStoreSettings;
}> {
  const response = await fetch("/api/admin/store-settings", {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function updateAdminStoreSettings(
  input: PublicStoreSettings,
): Promise<{ settings: PublicStoreSettings }> {
  const response = await fetch(
    "/api/admin/store-settings",
    jsonInit("PATCH", input),
  );
  return parseApiResponse(response);
}

export async function fetchAdminDashboard(): Promise<{
  dashboard: DashboardSummary;
}> {
  const response = await fetch("/api/admin/dashboard", {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function invalidateStoreQueries(
  queryClient: QueryClient,
): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: storeQueryKey.all });
}
