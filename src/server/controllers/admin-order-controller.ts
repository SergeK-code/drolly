import "server-only";

import { getCurrentUser } from "@/server/auth/protect";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { jsonSuccess, validateData } from "@/server/http/api";
import { getQueryParams, parseJsonBody } from "@/server/http/parse-request";
import {
  adminOrderStatusBodySchema,
  orderIdSchema,
  orderListQuerySchema,
} from "@/server/orders/schemas";
import {
  getAdminOrder,
  listAdminOrders,
  updateAdminOrderStatus,
} from "@/server/services/order-service";

export async function listAdminOrderPage(request: Request, requestId: string) {
  const user = await getCurrentUser();
  const query = validateData(orderListQuerySchema, getQueryParams(request));
  const data = await listAdminOrders(user, query);
  return jsonSuccess(data, { requestId });
}

export async function getAdminOrderDetail(request: Request, requestId: string) {
  const user = await getCurrentUser();
  const orderId = validateData(orderIdSchema, orderIdFromPath(request));
  const order = await getAdminOrder(user, orderId);
  return jsonSuccess({ order }, { requestId });
}

export async function patchAdminOrderStatus(
  request: Request,
  requestId: string,
) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  const orderId = validateData(orderIdSchema, orderIdFromPath(request));
  const body = await parseJsonBody(request);
  const { status } = validateData(adminOrderStatusBodySchema, body);
  const order = await updateAdminOrderStatus(user, orderId, status);
  return jsonSuccess({ order }, { requestId });
}

function orderIdFromPath(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  const ordersIndex = parts.lastIndexOf("orders");
  return decodeURIComponent(parts[ordersIndex + 1] ?? "");
}
