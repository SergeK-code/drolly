import {
  deleteProduct,
  getProduct,
  patchProduct,
} from "@/server/controllers/admin-catalog-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return getProduct(request, requestId);
});

export const PATCH = apiHandler(async ({ request, requestId }) => {
  return patchProduct(request, requestId);
});

export const DELETE = apiHandler(async ({ request, requestId }) => {
  return deleteProduct(request, requestId);
});
