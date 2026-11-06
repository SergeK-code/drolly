import "server-only";

import { getCurrentUser } from "@/server/auth/protect";
import { jsonSuccess, validateData } from "@/server/http/api";
import { getQueryParams } from "@/server/http/parse-request";
import { orderIdSchema, orderListQuerySchema } from "@/server/orders/schemas";
import {
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

function lastPathSegment(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts.at(-1) ?? "");
}
