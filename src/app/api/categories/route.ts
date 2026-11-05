import { getCategoryList } from "@/server/controllers/catalog-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return getCategoryList(request, requestId);
});
