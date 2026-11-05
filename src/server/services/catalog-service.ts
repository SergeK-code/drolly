import { AppError } from "@/server/http/api";
import {
  decodeCategoryCursor,
  decodeProductCursor,
  encodeCursor,
  pageOffset,
  splitPage,
  type PaginatedResult,
} from "@/server/catalog/pagination";
import {
  isPublicCategoryRow,
  isPublicProductRow,
  sanitizeSearchTerm,
  toPublicCategory,
  toPublicProduct,
  type PublicCategory,
  type PublicProduct,
} from "@/server/catalog/public";
import type { CategoryListQuery, ProductListQuery } from "@/server/catalog/schemas";
import {
  getPublicCategoryBySlug,
  getPublicProductByIdOrSlug,
  listPublicCategories,
  listPublicProducts,
} from "@/server/repositories/catalog-repository";

export async function listCategories(
  query: CategoryListQuery,
): Promise<PaginatedResult<PublicCategory>> {
  const offset = query.page ? pageOffset(query.page, query.limit) : undefined;
  const rows = await listPublicCategories({
    limit: query.limit,
    cursor: query.cursor ? decodeCategoryCursor(query.cursor) : undefined,
    offset,
  });

  const publicRows = rows.filter(isPublicCategoryRow);
  const { items, hasMore } = splitPage(publicRows, query.limit);
  const last = items[items.length - 1];

  return {
    items: items.map(toPublicCategory),
    hasMore,
    nextCursor:
      hasMore && last && !query.page
        ? encodeCursor({ sortOrder: last.sortOrder, id: last.id })
        : null,
    page: query.page ?? null,
  };
}

export async function getCategory(slug: string): Promise<PublicCategory> {
  const row = await getPublicCategoryBySlug(slug);

  if (!row || !isPublicCategoryRow(row)) {
    throw new AppError("NOT_FOUND", 404, "Category not found.");
  }

  return toPublicCategory(row);
}

export async function listProducts(
  query: ProductListQuery,
): Promise<PaginatedResult<PublicProduct>> {
  const sort = query.sort ?? "newest";
  const offset = query.page ? pageOffset(query.page, query.limit) : undefined;
  const rows = await listPublicProducts({
    limit: query.limit,
    search: query.q ? sanitizeSearchTerm(query.q) : undefined,
    categoryId: query.categoryId,
    categorySlug: query.category,
    sort,
    cursor:
      sort === "newest" && query.cursor
        ? decodeProductCursor(query.cursor)
        : undefined,
    offset,
  });

  const publicRows = rows.filter(isPublicProductRow);
  const { items, hasMore } = splitPage(publicRows, query.limit);
  const last = items[items.length - 1];

  return {
    items: items.map(toPublicProduct),
    hasMore,
    nextCursor:
      hasMore && last && !query.page
        ? encodeCursor({ createdAt: last.createdAt, id: last.id })
        : null,
    page: query.page ?? null,
  };
}

export async function getProduct(idOrSlug: string): Promise<PublicProduct> {
  const row = await getPublicProductByIdOrSlug(idOrSlug);

  if (!row || !isPublicProductRow(row)) {
    throw new AppError("NOT_FOUND", 404, "Product not found.");
  }

  return toPublicProduct(row);
}
