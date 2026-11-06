import { getOrderDetail } from "@/server/controllers/order-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return getOrderDetail(request, requestId);
});
