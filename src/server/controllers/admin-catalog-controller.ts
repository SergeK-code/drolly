import "server-only";

import {
  adminActiveSchema,
  adminCategoryWriteSchema,
  adminIdSchema,
  adminListQuerySchema,
  adminProductWriteSchema,
  rejectPrivilegedCatalogFields,
} from "@/server/catalog/admin-schemas";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { jsonSuccess, validateData } from "@/server/http/api";
import { getQueryParams, parseJsonBody } from "@/server/http/parse-request";
import {
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminCategory,
  getAdminProduct,
  listAdminCategoryPage,
  listAdminProductPage,
  setAdminCategoryActive,
  setAdminProductActive,
  updateAdminCategory,
  updateAdminProduct,
} from "@/server/services/admin-catalog-service";

export async function listAdminCategories(request: Request, requestId: string) {
  const query = validateData(adminListQuerySchema, getQueryParams(request));
  const data = await listAdminCategoryPage(query);
  return jsonSuccess(data, { requestId });
}

export async function createCategory(request: Request, requestId: string) {
  assertSameOrigin(request);
  const body = await parseJsonBody(request);
  rejectPrivilegedCatalogFields(body);
  const input = validateData(adminCategoryWriteSchema, body);
  const category = await createAdminCategory(input);
  return jsonSuccess({ category }, { status: 201, requestId });
}

export async function getCategory(request: Request, requestId: string) {
  const category = await getAdminCategory(adminResourceId(request, "categories"));
  return jsonSuccess({ category }, { requestId });
}

export async function patchCategory(request: Request, requestId: string) {
  assertSameOrigin(request);
  const body = await parseJsonBody(request);
  rejectPrivilegedCatalogFields(body);
  const input = validateData(adminCategoryWriteSchema, body);
  const category = await updateAdminCategory(
    adminResourceId(request, "categories"),
    input,
  );
  return jsonSuccess({ category }, { requestId });
}

export async function setCategoryActiveState(
  request: Request,
  requestId: string,
) {
  assertSameOrigin(request);
  const body = await parseJsonBody(request);
  const { isActive } = validateData(adminActiveSchema, body);
  const category = await setAdminCategoryActive(
    adminResourceId(request, "categories"),
    isActive,
  );
  return jsonSuccess({ category }, { requestId });
}

export async function deleteCategory(request: Request, requestId: string) {
  assertSameOrigin(request);
  await deleteAdminCategory(adminResourceId(request, "categories"));
  return jsonSuccess({ deleted: true }, { requestId });
}

export async function listAdminProducts(request: Request, requestId: string) {
  const query = validateData(adminListQuerySchema, getQueryParams(request));
  const data = await listAdminProductPage(query);
  return jsonSuccess(data, { requestId });
}

export async function createProduct(request: Request, requestId: string) {
  assertSameOrigin(request);
  const body = await parseJsonBody(request);
  rejectPrivilegedCatalogFields(body);
  const input = validateData(adminProductWriteSchema, body);
  const product = await createAdminProduct(input);
  return jsonSuccess({ product }, { status: 201, requestId });
}

export async function getProduct(request: Request, requestId: string) {
  const product = await getAdminProduct(adminResourceId(request, "products"));
  return jsonSuccess({ product }, { requestId });
}

export async function patchProduct(request: Request, requestId: string) {
  assertSameOrigin(request);
  const body = await parseJsonBody(request);
  rejectPrivilegedCatalogFields(body);
  const input = validateData(adminProductWriteSchema, body);
  const product = await updateAdminProduct(
    adminResourceId(request, "products"),
    input,
  );
  return jsonSuccess({ product }, { requestId });
}

export async function setProductActiveState(
  request: Request,
  requestId: string,
) {
  assertSameOrigin(request);
  const body = await parseJsonBody(request);
  const { isActive } = validateData(adminActiveSchema, body);
  const product = await setAdminProductActive(
    adminResourceId(request, "products"),
    isActive,
  );
  return jsonSuccess({ product }, { requestId });
}

export async function deleteProduct(request: Request, requestId: string) {
  assertSameOrigin(request);
  await deleteAdminProduct(adminResourceId(request, "products"));
  return jsonSuccess({ deleted: true }, { requestId });
}

function adminResourceId(request: Request, collection: string): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  const index = parts.indexOf(collection);
  return validateData(adminIdSchema, parts[index + 1] ?? "");
}

