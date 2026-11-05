import { setProductActiveState } from "@/server/controllers/admin-catalog-controller";
import { apiHandler } from "@/server/http/api";

export const POST = apiHandler(async ({ request, requestId }) => {
  return setProductActiveState(request, requestId);
});
