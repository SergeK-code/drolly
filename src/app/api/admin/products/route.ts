import {
  createProduct,
  listAdminProducts,
} from "@/server/controllers/admin-catalog-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ request, requestId }) => {
  return listAdminProducts(request, requestId);
});

export const POST = apiHandler(async ({ request, requestId }) => {
  return createProduct(request, requestId);
});
