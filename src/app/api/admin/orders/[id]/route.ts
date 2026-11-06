import { getAdminOrderDetail } from "@/server/controllers/admin-order-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return getAdminOrderDetail(request, requestId);
});
