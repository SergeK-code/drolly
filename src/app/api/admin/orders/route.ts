import { listAdminOrderPage } from "@/server/controllers/admin-order-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return listAdminOrderPage(request, requestId);
});
