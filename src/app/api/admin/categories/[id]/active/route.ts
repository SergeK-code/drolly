import { setCategoryActiveState } from "@/server/controllers/admin-catalog-controller";
import { apiHandler } from "@/server/http/api";

export const POST = apiHandler(async ({ request, requestId }) => {
  return setCategoryActiveState(request, requestId);
});
