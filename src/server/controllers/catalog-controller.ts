import "server-only";

import { jsonSuccess, validateData } from "@/server/http/api";
import { getQueryParams } from "@/server/http/parse-request";
import {
  categoryListQuerySchema,
  categorySlugSchema,
  productIdOrSlugSchema,
  productListQuerySchema,
} from "@/server/catalog/schemas";
import {
  getCategory,
  getProduct,
  listCategories,
  listProducts,
} from "@/server/services/catalog-service";

export async function getCategoryList(request: Request, requestId: string) {
  const query = validateData(categoryListQuerySchema, getQueryParams(request));
  const data = await listCategories(query);
  return jsonSuccess(data, { requestId });
}

export async function getCategoryDetail(request: Request, requestId: string) {
  const slug = validateData(categorySlugSchema, lastPathSegment(request));
  const data = await getCategory(slug);
  return jsonSuccess({ category: data }, { requestId });
}

export async function getProductList(request: Request, requestId: string) {
  const query = validateData(productListQuerySchema, getQueryParams(request));
  const data = await listProducts(query);
  return jsonSuccess(data, { requestId });
}

export async function getProductDetail(request: Request, requestId: string) {
  const idOrSlug = validateData(productIdOrSlugSchema, lastPathSegment(request));
  const data = await getProduct(idOrSlug);
  return jsonSuccess({ product: data }, { requestId });
}

function lastPathSegment(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts.at(-1) ?? "");
}
