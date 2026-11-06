import { parseApiResponse } from "@/lib/ui/api";
import type { OrderStatusCode } from "@/lib/order-status";
import {
  ordersQueryKey,
  type PaginatedOrders,
  type PublicOrder,
} from "@/features/orders/api";

export { ordersQueryKey };
export type { PaginatedOrders, PublicOrder };

export async function fetchAdminOrders(input?: {
  page?: number;
  status?: string;
}): Promise<PaginatedOrders> {
  const params = new URLSearchParams({ limit: "12" });
  if (input?.page) {
    params.set("page", String(input.page));
  }
  if (input?.status) {
    params.set("status", input.status);
  }
  const response = await fetch(`/api/admin/orders?${params.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function fetchAdminOrder(
  id: string,
): Promise<{ order: PublicOrder }> {
  const response = await fetch(`/api/admin/orders/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  return parseApiResponse(response);
}

export async function updateAdminOrderStatus(
  id: string,
  status: OrderStatusCode,
): Promise<{ order: PublicOrder }> {
  const response = await fetch(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parseApiResponse(response);
}
