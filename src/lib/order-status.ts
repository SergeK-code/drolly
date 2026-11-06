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

export const orderStatusCodeSchema = z.enum(ORDER_STATUS_CODES, {
  error: "Choose a valid order status.",
});

export const adminOrderStatusBodySchema = z
  .object({
    status: orderStatusCodeSchema,
  })
  .strict();

export const ORDER_STATUS_TRANSITIONS: Record<
  OrderStatusCode,
  readonly OrderStatusCode[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

export function canTransitionOrderStatus(
  from: OrderStatusCode,
  to: OrderStatusCode,
): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}
