import { z } from "zod";

export const ORDER_STATUS_CODES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatusCode = (typeof ORDER_STATUS_CODES)[number];

/** Display names seeded on public.order_statuses. */
export const ORDER_STATUS_NAMES: Record<OrderStatusCode, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUSES = ORDER_STATUS_CODES.map((code) => ({
  code,
  name: ORDER_STATUS_NAMES[code],
}));

export const orderStatusCodeSchema = z.enum(ORDER_STATUS_CODES, {
  error: "Choose a valid order status.",
});

export const adminOrderStatusBodySchema = z
  .object({
    status: orderStatusCodeSchema,
  })
  .strict();

export function orderStatusName(code: OrderStatusCode): string {
  return ORDER_STATUS_NAMES[code];
}

export function canTransitionOrderStatus(
  from: OrderStatusCode,
  to: OrderStatusCode,
): boolean {
  return from !== to;
}

const CUSTOMER_CANCELABLE_STATUSES: readonly OrderStatusCode[] = [
  "pending",
  "confirmed",
];

export function canCustomerCancelOrder(status: OrderStatusCode): boolean {
  return CUSTOMER_CANCELABLE_STATUSES.includes(status);
}
