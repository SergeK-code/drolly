import "server-only";

import { getCurrentUser } from "@/server/auth/protect";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { jsonSuccess, validateData } from "@/server/http/api";
import { getClientIp } from "@/server/http/client-ip";
import { getQueryParams } from "@/server/http/parse-request";
import { assertWithinRateLimit } from "@/server/http/rate-limit";
import { customerOrderRateLimiter } from "@/server/orders/checkout-limiter";
import { orderIdSchema, orderListQuerySchema } from "@/server/orders/schemas";
import {
  cancelCustomerOrder,
  getCustomerOrder,
  listCustomerOrders,
} from "@/server/services/order-service";

export async function getOrderList(request: Request, requestId: string) {
  const user = await getCurrentUser();
  const query = validateData(orderListQuerySchema, getQueryParams(request));
  const data = await listCustomerOrders(user, query);
  return jsonSuccess(data, { requestId });
}

export async function getOrderDetail(request: Request, requestId: string) {
  const user = await getCurrentUser();
  const orderId = validateData(orderIdSchema, lastPathSegment(request));
  const order = await getCustomerOrder(user, orderId);
  return jsonSuccess({ order }, { requestId });
}

export async function postCancelOwnOrder(request: Request, requestId: string) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  assertWithinRateLimit(
    customerOrderRateLimiter,
    `${user?.id ?? getClientIp(request)}:cancel-order`,
  );
  const orderId = validateData(orderIdSchema, orderIdFromPath(request));
  const order = await cancelCustomerOrder(user, orderId);
  return jsonSuccess({ order }, { requestId });
}

function lastPathSegment(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts.at(-1) ?? "");
}

function orderIdFromPath(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  const ordersIndex = parts.lastIndexOf("orders");
  return decodeURIComponent(parts[ordersIndex + 1] ?? "");
}
