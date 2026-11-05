import {
  deleteCategory,
  getCategory,
  patchCategory,
} from "@/server/controllers/admin-catalog-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return getCategory(request, requestId);
});

export const PATCH = apiHandler(async ({ request, requestId }) => {
  return patchCategory(request, requestId);
});

export const DELETE = apiHandler(async ({ request, requestId }) => {
  return deleteCategory(request, requestId);
});
