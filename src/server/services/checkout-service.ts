import "server-only";

import type { PublicUser } from "@/server/auth/public-user";
import { requireCustomer } from "@/server/auth/protect";
import { getOrderById, placeCodOrder } from "@/server/repositories/order-repository";
import type { CheckoutBody } from "@/server/orders/schemas";
import type { PublicOrder } from "@/server/orders/public";

export async function checkoutOrder(
  user: PublicUser | null,
  input: CheckoutBody,
): Promise<PublicOrder> {
  requireCustomer(user);
  const orderId = await placeCodOrder(input);
  return getOrderById(orderId);
}
