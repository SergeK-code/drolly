import { conflict, notFound, validationFailed } from "@/server/http/api";
import { requireAdminFromSession } from "@/server/auth/protect";
import {
  decodeCategoryCursor,
  decodeProductCursor,
  encodeCursor,
  splitPage,
  type PaginatedResult,
} from "@/server/catalog/pagination";
import { sanitizeSearchTerm } from "@/server/catalog/public";
import { slugFromName } from "@/server/catalog/schemas";
import {
  toAdminCategory,
  toAdminProduct,
  type AdminCategory,
  type AdminProduct,
} from "@/server/catalog/admin-public";
import type {
  AdminCategoryWrite,
  AdminListQuery,
  AdminProductWrite,
} from "@/server/catalog/admin-schemas";
import {
  findCategoryIdBySlug,
  findProductIdBySlug,
  getAdminCategoryById,
  getAdminProductById,
  insertCategory,
  insertProduct,
  countProductsForCategory,
  deleteCategory,
  deleteProduct,
  listAdminCategories,
  listAdminProducts,
  setCategoryActive,
  setProductActive,
  updateCategory,
  updateProduct,
} from "@/server/repositories/catalog-repository";

export async function listAdminCategoryPage(
  query: AdminListQuery,
): Promise<PaginatedResult<AdminCategory>> {
  await requireAdminFromSession();
  const rows = await listAdminCategories({
    limit: query.limit,
    cursor: query.cursor ? decodeCategoryCursor(query.cursor) : undefined,
  });
  const { items, hasMore } = splitPage(rows, query.limit);
  const last = items[items.length - 1];

  return {
    items: items.map(toAdminCategory),
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({ sortOrder: last.sortOrder, id: last.id })
        : null,
    page: null,
  };
}

export async function getAdminCategory(id: string): Promise<AdminCategory> {
  await requireAdminFromSession();
  const row = await getAdminCategoryById(id);
  if (!row) {
    throw notFound("Category not found.");
  }

  return toAdminCategory(row);
}

export async function createAdminCategory(
  input: AdminCategoryWrite,
): Promise<AdminCategory> {
  await requireAdminFromSession();
  const slug = await uniqueCategorySlug(slugFromName(input.name));
  const row = await insertCategory({
    name: input.name,
    slug,
    description: input.description,
    sortOrder: input.sortOrder,
    imagePath: input.imagePath,
  });
  return toAdminCategory(row);
}

export async function updateAdminCategory(
  id: string,
  input: AdminCategoryWrite,
): Promise<AdminCategory> {
  await requireAdminFromSession();
  if (!(await getAdminCategoryById(id))) {
    throw notFound("Category not found.");
  }
  const slug = await uniqueCategorySlug(slugFromName(input.name), id);
  const row = await updateCategory(id, {
    name: input.name,
    slug,
    description: input.description,
    sortOrder: input.sortOrder,
    imagePath: input.imagePath,
  });
  return toAdminCategory(row);
}

export async function setAdminCategoryActive(
  id: string,
  isActive: boolean,
): Promise<AdminCategory> {
  await requireAdminFromSession();
  if (!(await getAdminCategoryById(id))) {
    throw notFound("Category not found.");
  }
  const row = await setCategoryActive(id, isActive);
  return toAdminCategory(row);
}

export async function deleteAdminCategory(id: string): Promise<void> {
  await requireAdminFromSession();
  if (!(await getAdminCategoryById(id))) {
    throw notFound("Category not found.");
  }

  const productCount = await countProductsForCategory(id);
  if (productCount > 0) {
    throw conflict(
      "This category cannot be deleted because it is used by products.",
    );
  }

  await deleteCategory(id);
}

export async function listAdminProductPage(
  query: AdminListQuery,
): Promise<PaginatedResult<AdminProduct>> {
  await requireAdminFromSession();
  const rows = await listAdminProducts({
    limit: query.limit,
    search: query.q ? sanitizeSearchTerm(query.q) : undefined,
    categoryId: query.categoryId,
    cursor: query.cursor ? decodeProductCursor(query.cursor) : undefined,
  });
  const { items, hasMore } = splitPage(rows, query.limit);
  const last = items[items.length - 1];

  return {
    items: items.map(toAdminProduct),
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt, id: last.id })
        : null,
    page: null,
  };
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  await requireAdminFromSession();
  const row = await getAdminProductById(id);
  if (!row) {
    throw notFound("Product not found.");
  }

  return toAdminProduct(row);
}

export async function createAdminProduct(
  input: AdminProductWrite,
): Promise<AdminProduct> {
  await requireAdminFromSession();
  await assertCategoryExists(input.categoryId);
  const slug = await uniqueProductSlug(slugFromName(input.name));
  const row = await insertProduct({
    name: input.name,
    slug,
    description: input.description,
    categoryId: input.categoryId,
    priceMinor: input.priceMinor,
    currency: input.currency,
    stockQuantity: input.stockQuantity,
    imagePath: input.imagePath,
  });
  return toAdminProduct(row);
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductWrite,
): Promise<AdminProduct> {
  await requireAdminFromSession();
  await assertProductExists(id);
  await assertCategoryExists(input.categoryId);
  const slug = await uniqueProductSlug(slugFromName(input.name), id);
  const row = await updateProduct(id, {
    name: input.name,
    slug,
    description: input.description,
    categoryId: input.categoryId,
    priceMinor: input.priceMinor,
    currency: input.currency,
    stockQuantity: input.stockQuantity,
    imagePath: input.imagePath,
  });
  return toAdminProduct(row);
}

export async function setAdminProductActive(
  id: string,
  isActive: boolean,
): Promise<AdminProduct> {
  await requireAdminFromSession();
  await assertProductExists(id);
  const row = await setProductActive(id, isActive);
  return toAdminProduct(row);
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await requireAdminFromSession();
  await assertProductExists(id);
  await deleteProduct(id);
}

async function assertCategoryExists(id: string): Promise<void> {
  const row = await getAdminCategoryById(id);
  if (!row) {
    throw validationFailed({
      categoryId: ["Category does not exist."],
    });
  }
}

async function assertProductExists(id: string): Promise<void> {
  const row = await getAdminProductById(id);
  if (!row) {
    throw notFound("Product not found.");
  }
}

async function uniqueCategorySlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  return uniqueSlug(base, (slug) => findCategoryIdBySlug(slug, excludeId));
}

async function uniqueProductSlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  return uniqueSlug(base, (slug) => findProductIdBySlug(slug, excludeId));
}

async function uniqueSlug(
  base: string,
  existingId: (slug: string) => Promise<string | null>,
): Promise<string> {
  if (!(await existingId(base))) {
    return base;
  }

  for (let n = 2; n < 50; n += 1) {
    const candidate = `${base}-${n}`;
    if (!(await existingId(candidate))) {
      return candidate;
    }
  }

  throw conflict("Could not create a unique slug.");
}
