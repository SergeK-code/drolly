import { patchAdminOrderStatus } from "@/server/controllers/admin-order-controller";
import { apiHandler } from "@/server/http/api";

export const PATCH = apiHandler(async ({ request, requestId }) => {
  return patchAdminOrderStatus(request, requestId);
});
