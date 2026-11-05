import { getCategoryDetail } from "@/server/controllers/catalog-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return getCategoryDetail(request, requestId);
});
