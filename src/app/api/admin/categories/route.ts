import {
  createCategory,
  listAdminCategories,
} from "@/server/controllers/admin-catalog-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return listAdminCategories(request, requestId);
});

export const POST = apiHandler(async ({ request, requestId }) => {
  return createCategory(request, requestId);
});
