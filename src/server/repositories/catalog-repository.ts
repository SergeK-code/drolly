import "server-only";

import { conflict, notFound, serviceUnavailable } from "@/server/http/api";
import type {
  CatalogCategoryRow,
  CatalogProductRow,
} from "@/server/catalog/public";
import { logger } from "@/server/logging/logger";
import type {
  CategoryCursor,
  ProductCursor,
} from "@/server/catalog/pagination";
import type { ProductSort } from "@/server/catalog/schemas";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type ListPublicCategoriesInput = {
  limit: number;
  cursor?: CategoryCursor;
  offset?: number;
};

export type ListPublicProductsInput = {
  limit: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  sort?: ProductSort;
  cursor?: ProductCursor;
  offset?: number;
};

type CategoryQueryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  is_active: boolean;
  sort_order: number;
};

type ProductQueryRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price_minor: number;
  currency: string;
  stock_quantity: number;
  image_path: string | null;
  is_active: boolean;
  created_at: string;
  categories:
    | {
        id: string;
        name: string;
        slug: string;
        is_active: boolean;
      }
    | {
        id: string;
        name: string;
        slug: string;
        is_active: boolean;
      }[]
    | null;
};

const CATEGORY_SELECT =
  "id, name, slug, description, image_path, is_active, sort_order";
const PRODUCT_SELECT =
  "id, category_id, name, slug, description, price_minor, currency, stock_quantity, image_path, is_active, created_at, categories!inner(id, name, slug, is_active)";

export async function listPublicCategories(
  input: ListPublicCategoriesInput,
): Promise<CatalogCategoryRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (input.cursor) {
    const { sortOrder, id } = input.cursor;
    query = query.or(
      `sort_order.gt.${sortOrder},and(sort_order.eq.${sortOrder},id.gt.${id})`,
    );
  }

  if (input.offset !== undefined) {
    query = query.range(input.offset, input.offset + input.limit);
  } else {
    query = query.limit(input.limit + 1);
  }

  const { data, error } = await query;
  throwIfCatalogError(error);

  return ((data ?? []) as CategoryQueryRow[]).map(mapCategoryRow);
}

export async function getPublicCategoryBySlug(
  slug: string,
): Promise<CatalogCategoryRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  throwIfCatalogError(error);

  return data ? mapCategoryRow(data as CategoryQueryRow) : null;
}

export async function listPublicProducts(
  input: ListPublicProductsInput,
): Promise<CatalogProductRow[]> {
  const supabase = await createSupabaseServerClient();
  const sort = input.sort ?? "newest";
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("categories.is_active", true);

  query = applyProductSort(query, sort);

  if (input.categoryId) {
    query = query.eq("category_id", input.categoryId);
  }

  if (input.categorySlug) {
    query = query.eq("categories.slug", input.categorySlug);
  }

  if (input.search) {
    query = query.or(
      `name.ilike.%${input.search}%,description.ilike.%${input.search}%`,
    );
  }

  if (input.cursor && sort === "newest") {
    const { createdAt, id } = input.cursor;
    query = query.or(
      `created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt.${id})`,
    );
  }

  if (input.offset !== undefined) {
    query = query.range(input.offset, input.offset + input.limit);
  } else {
    query = query.limit(input.limit + 1);
  }

  const { data, error } = await query;
  throwIfCatalogError(error);

  return ((data ?? []) as ProductQueryRow[]).map(mapProductRow);
}

export async function getPublicProductByIdOrSlug(
  idOrSlug: string,
): Promise<CatalogProductRow | null> {
  const supabase = await createSupabaseServerClient();
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrSlug,
    );

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("categories.is_active", true);

  query = isUuid ? query.eq("id", idOrSlug) : query.eq("slug", idOrSlug);

  const { data, error } = await query.maybeSingle();
  throwIfCatalogError(error);

  return data ? mapProductRow(data as ProductQueryRow) : null;
}

const ADMIN_PRODUCT_SELECT =
  "id, category_id, name, slug, description, price_minor, currency, stock_quantity, image_path, is_active, created_at, categories(id, name, slug, is_active)";

export async function listAdminCategories(
  input: ListPublicCategoriesInput,
): Promise<CatalogCategoryRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (input.cursor) {
    const { sortOrder, id } = input.cursor;
    query = query.or(
      `sort_order.gt.${sortOrder},and(sort_order.eq.${sortOrder},id.gt.${id})`,
    );
  }

  query = query.limit(input.limit + 1);
  const { data, error } = await query;
  throwIfCatalogError(error);
  return ((data ?? []) as CategoryQueryRow[]).map(mapCategoryRow);
}

export async function getAdminCategoryById(
  id: string,
): Promise<CatalogCategoryRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(CATEGORY_SELECT)
    .eq("id", id)
    .maybeSingle();

  throwIfCatalogError(error);
  return data ? mapCategoryRow(data as CategoryQueryRow) : null;
}

export async function findCategoryIdBySlug(
  slug: string,
  excludeId?: string,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("categories").select("id").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  throwIfCatalogError(error);
  return data?.id ?? null;
}

export async function insertCategory(input: {
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  imagePath?: string | null;
}): Promise<CatalogCategoryRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      sort_order: input.sortOrder,
      image_path: input.imagePath ?? null,
      is_active: true,
    })
    .select(CATEGORY_SELECT)
    .single();

  throwIfCatalogWriteError(error, "slug");
  return mapCategoryRow(data as CategoryQueryRow);
}

export async function updateCategory(
  id: string,
  input: {
    name: string;
    slug: string;
    description: string | null;
    sortOrder: number;
    imagePath?: string | null;
  },
): Promise<CatalogCategoryRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      sort_order: input.sortOrder,
      image_path: input.imagePath ?? null,
    })
    .eq("id", id)
    .select(CATEGORY_SELECT)
    .maybeSingle();

  throwIfCatalogWriteError(error, "slug");
  if (!data) {
    throw notFound("Category not found.");
  }

  return mapCategoryRow(data as CategoryQueryRow);
}

export async function countProductsForCategory(
  categoryId: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  throwIfCatalogError(error);
  return count ?? 0;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error?.code === "23503") {
    throw conflict(
      "This category cannot be deleted because it is used by products.",
    );
  }

  throwIfCatalogError(error);
  if (!data) {
    throw notFound("Category not found.");
  }
}

export async function setCategoryActive(
  id: string,
  isActive: boolean,
): Promise<CatalogCategoryRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id)
    .select(CATEGORY_SELECT)
    .maybeSingle();

  throwIfCatalogError(error);
  if (!data) {
    throw notFound("Category not found.");
  }

  return mapCategoryRow(data as CategoryQueryRow);
}

export async function listAdminProducts(
  input: ListPublicProductsInput,
): Promise<CatalogProductRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (input.categoryId) {
    query = query.eq("category_id", input.categoryId);
  }

  if (input.search) {
    query = query.or(
      `name.ilike.%${input.search}%,description.ilike.%${input.search}%`,
    );
  }

  if (input.cursor) {
    const { createdAt, id } = input.cursor;
    query = query.or(
      `created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt.${id})`,
    );
  }

  query = query.limit(input.limit + 1);
  const { data, error } = await query;
  throwIfCatalogError(error);
  return ((data ?? []) as ProductQueryRow[]).map(mapProductRow);
}

export async function getAdminProductById(
  id: string,
): Promise<CatalogProductRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  throwIfCatalogError(error);
  return data ? mapProductRow(data as ProductQueryRow) : null;
}

export async function findProductIdBySlug(
  slug: string,
  excludeId?: string,
): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("products").select("id").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.maybeSingle();
  throwIfCatalogError(error);
  return data?.id ?? null;
}

export async function insertProduct(input: {
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  imagePath?: string | null;
}): Promise<CatalogProductRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      category_id: input.categoryId,
      price_minor: input.priceMinor,
      currency: input.currency,
      stock_quantity: input.stockQuantity,
      image_path: input.imagePath ?? null,
      is_active: true,
    })
    .select(ADMIN_PRODUCT_SELECT)
    .single();

  throwIfCatalogWriteError(error, "slug");
  return mapProductRow(data as ProductQueryRow);
}

export async function updateProduct(
  id: string,
  input: {
    name: string;
    slug: string;
    description: string | null;
    categoryId: string;
    priceMinor: number;
    currency: string;
    stockQuantity: number;
    imagePath?: string | null;
  },
): Promise<CatalogProductRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      category_id: input.categoryId,
      price_minor: input.priceMinor,
      currency: input.currency,
      stock_quantity: input.stockQuantity,
      image_path: input.imagePath ?? null,
    })
    .eq("id", id)
    .select(ADMIN_PRODUCT_SELECT)
    .maybeSingle();

  throwIfCatalogWriteError(error, "slug");
  if (!data) {
    throw notFound("Product not found.");
  }

  return mapProductRow(data as ProductQueryRow);
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  throwIfCatalogError(error);
  if (!data) {
    throw notFound("Product not found.");
  }
}

export async function setProductActive(
  id: string,
  isActive: boolean,
): Promise<CatalogProductRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", id)
    .select(ADMIN_PRODUCT_SELECT)
    .maybeSingle();

  throwIfCatalogError(error);
  if (!data) {
    throw notFound("Product not found.");
  }

  return mapProductRow(data as ProductQueryRow);
}

export async function countOrderItemsForProduct(
  productId: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  throwIfCatalogError(error);
  return count ?? 0;
}

function mapCategoryRow(row: CategoryQueryRow): CatalogCategoryRow {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imagePath: row.image_path,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

function mapProductRow(row: ProductQueryRow): CatalogProductRow {
  const category = Array.isArray(row.categories)
    ? row.categories[0]
    : row.categories;

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: category?.name ?? "",
    categorySlug: category?.slug ?? "",
    categoryIsActive: category?.is_active ?? false,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceMinor: row.price_minor,
    currency: row.currency,
    stockQuantity: row.stock_quantity,
    imagePath: row.image_path,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function applyProductSort<
  T extends {
    order: (column: string, options: { ascending: boolean }) => T;
  },
>(query: T, sort: ProductSort): T {
  switch (sort) {
    case "price-asc":
      return query
        .order("price_minor", { ascending: true })
        .order("id", { ascending: true });
    case "price-desc":
      return query
        .order("price_minor", { ascending: false })
        .order("id", { ascending: false });
    case "name-asc":
      return query.order("name", { ascending: true }).order("id", { ascending: true });
    case "name-desc":
      return query
        .order("name", { ascending: false })
        .order("id", { ascending: false });
    default:
      return query
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
  }
}

function throwIfCatalogWriteError(
  error: { code?: string } | null,
  uniqueField: string,
): void {
  if (error?.code === "23505") {
    throw conflict("This value is already used.", {
      [uniqueField]: ["This value is already used."],
    });
  }

  throwIfCatalogError(error);
}

function throwIfCatalogError(error: { code?: string } | null): void {
  if (!error) {
    return;
  }

  logger.warn({ code: error.code }, "Catalog query failed");
  throw serviceUnavailable();
}
