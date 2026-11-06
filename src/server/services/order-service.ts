import "server-only";

import type { PublicUser } from "@/server/auth/public-user";
import {
  requireAdmin,
  requireAuthenticatedUser,
} from "@/server/auth/protect";
import { conflict } from "@/server/http/api";
import type { PublicOrder } from "@/server/orders/public";
import type { OrderListQuery, OrderStatusCode } from "@/server/orders/schemas";
import { canTransitionOrderStatus } from "@/server/orders/transitions";
import {
  getOrderById,
  listOrders,
  updateOrderStatusRow,
} from "@/server/repositories/order-repository";

export async function listCustomerOrders(
  user: PublicUser | null,
  query: OrderListQuery,
) {
  const current = requireAuthenticatedUser(user);
  return listOrders(query, { userId: current.id });
}

export async function getCustomerOrder(
  user: PublicUser | null,
  orderId: string,
): Promise<PublicOrder> {
  requireAuthenticatedUser(user);
  return getOrderById(orderId);
}

export async function listAdminOrders(
  user: PublicUser | null,
  query: OrderListQuery,
) {
  requireAdmin(user);
  return listOrders(query, { includeCustomer: true });
}

export async function getAdminOrder(
  user: PublicUser | null,
  orderId: string,
): Promise<PublicOrder> {
  requireAdmin(user);
  return getOrderById(orderId, { includeCustomer: true });
}

export async function updateAdminOrderStatus(
  user: PublicUser | null,
  orderId: string,
  status: OrderStatusCode,
): Promise<PublicOrder> {
  requireAdmin(user);
  const current = await getOrderById(orderId, { includeCustomer: true });

  if (current.status === status) {
    return current;
  }

  if (!canTransitionOrderStatus(current.status, status)) {
    throw conflict("That status change is not allowed.");
  }

  return updateOrderStatusRow({
    orderId,
    fromStatus: current.status,
    toStatus: status,
  });
}
