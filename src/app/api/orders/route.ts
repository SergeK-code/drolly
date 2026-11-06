import { getOrderList } from "@/server/controllers/order-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return getOrderList(request, requestId);
});
