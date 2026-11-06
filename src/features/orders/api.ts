import { adminCatalogQueryKey } from "@/features/admin-catalog/query-keys";
import { catalogQueryKey } from "@/features/catalog/query-keys";
import { parseApiResponse } from "@/lib/ui/api";
import type { OrderStatusCode } from "@/lib/order-status";
import type { QueryClient } from "@tanstack/react-query";

export type PublicAddress = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  addressLine: string;
  area: string;
  notes: string | null;
  isDefault: boolean;
};

export type PublicOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

export type PublicOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatusCode;
  statusName: string;
  recipientName: string;
  phone: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  currency: string;
  paymentMethod: "cash_on_delivery";
  createdAt: string;
  customerName?: string;
  items: PublicOrderItem[];
};

export type PaginatedOrders = {
  items: PublicOrder[];
  hasMore: boolean;
  nextCursor: string | null;
  page: number | null;
};

export const ordersQueryKey = {
  all: ["orders"] as const,
  list: () => [...ordersQueryKey.all, "list"] as const,
  detail: (id: string) => [...ordersQueryKey.all, "detail", id] as const,
  addresses: () => [...ordersQueryKey.all, "addresses"] as const,
  admin: () => [...ordersQueryKey.all, "admin"] as const,
  adminDetail: (id: string) => [...ordersQueryKey.all, "admin", id] as const,
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

export async function fetchAddresses(): Promise<{ addresses: PublicAddress[] }> {
  const response = await fetch("/api/addresses", {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function createAddress(input: {
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine: string;
  area: string;
  notes?: string | null;
  isDefault?: boolean;
}): Promise<{ address: PublicAddress }> {
  const response = await fetch("/api/addresses", jsonInit("POST", input));
  return parseApiResponse(response);
}

export async function fetchOrders(page = 1): Promise<PaginatedOrders> {
  const params = new URLSearchParams({ limit: "12", page: String(page) });
  const response = await fetch(`/api/orders?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function fetchOrder(id: string): Promise<{ order: PublicOrder }> {
  const response = await fetch(`/api/orders/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function cancelOwnOrder(
  id: string,
): Promise<{ order: PublicOrder }> {
  const response = await fetch(`/api/orders/${id}/cancel`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function invalidateOrderQueries(
  queryClient: QueryClient,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ordersQueryKey.all }),
    queryClient.invalidateQueries({ queryKey: catalogQueryKey.all }),
    queryClient.invalidateQueries({ queryKey: adminCatalogQueryKey.all }),
  ]);
}
