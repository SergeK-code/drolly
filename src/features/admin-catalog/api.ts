import { catalogQueryKey } from "@/features/catalog/query-keys";
import { adminCatalogQueryKey } from "@/features/admin-catalog/query-keys";
import { parseApiResponse } from "@/lib/ui/api";
import type { QueryClient } from "@tanstack/react-query";

export { ApiError as AdminApiError } from "@/lib/ui/api";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  imagePath: string | null;
};

export type AdminProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string | null;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
  imagePath: string | null;
};

type Paginated<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  page: number | null;
};

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : "{}",
  };
}

export async function fetchAdminCategories(): Promise<Paginated<AdminCategory>> {
  const response = await fetch("/api/admin/categories?limit=24", {
    credentials: "include",
  });
  return parseApiResponse(response);
}

export async function fetchAdminCategory(
  id: string,
): Promise<{ category: AdminCategory }> {
  const response = await fetch(`/api/admin/categories/${id}`, {
    credentials: "include",
  });
  return parseApiResponse(response);
}

export async function uploadAdminImage(
  file: File,
  folder: "products" | "categories",
): Promise<{ path: string }> {
  const body = new FormData();
  body.set("file", file);
  body.set("folder", folder);
  const response = await fetch("/api/admin/uploads", {
    method: "POST",
    credentials: "include",
    body,
  });
  return parseApiResponse(response);
}

export async function createAdminCategory(input: {
  name: string;
  description: string | null;
  sortOrder: number;
  imagePath?: string | null;
}): Promise<{ category: AdminCategory }> {
  const response = await fetch("/api/admin/categories", jsonInit("POST", input));
  return parseApiResponse(response);
}

export async function updateAdminCategory(
  id: string,
  input: {
    name: string;
    description: string | null;
    sortOrder: number;
    imagePath?: string | null;
  },
): Promise<{ category: AdminCategory }> {
  const response = await fetch(
    `/api/admin/categories/${id}`,
    jsonInit("PATCH", input),
  );
  return parseApiResponse(response);
}

export async function setAdminCategoryActive(
  id: string,
  isActive: boolean,
): Promise<{ category: AdminCategory }> {
  const response = await fetch(
    `/api/admin/categories/${id}/active`,
    jsonInit("POST", { isActive }),
  );
  return parseApiResponse(response);
}

export async function deleteAdminCategory(
  id: string,
): Promise<{ deleted: boolean }> {
  const response = await fetch(`/api/admin/categories/${id}`, jsonInit("DELETE"));
  return parseApiResponse(response);
}

export async function fetchAdminProducts(): Promise<Paginated<AdminProduct>> {
  const response = await fetch("/api/admin/products?limit=24", {
    credentials: "include",
  });
  return parseApiResponse(response);
}

export async function fetchAdminProduct(
  id: string,
): Promise<{ product: AdminProduct }> {
  const response = await fetch(`/api/admin/products/${id}`, {
    credentials: "include",
  });
  return parseApiResponse(response);
}

export async function createAdminProduct(input: {
  name: string;
  description: string | null;
  categoryId: string;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  imagePath?: string | null;
}): Promise<{ product: AdminProduct }> {
  const response = await fetch("/api/admin/products", jsonInit("POST", input));
  return parseApiResponse(response);
}

export async function updateAdminProduct(
  id: string,
  input: {
    name: string;
    description: string | null;
    categoryId: string;
    priceMinor: number;
    currency: string;
    stockQuantity: number;
    imagePath?: string | null;
  },
): Promise<{ product: AdminProduct }> {
  const response = await fetch(
    `/api/admin/products/${id}`,
    jsonInit("PATCH", input),
  );
  return parseApiResponse(response);
}

export async function setAdminProductActive(
  id: string,
  isActive: boolean,
): Promise<{ product: AdminProduct }> {
  const response = await fetch(
    `/api/admin/products/${id}/active`,
    jsonInit("POST", { isActive }),
  );
  return parseApiResponse(response);
}

export async function deleteAdminProduct(
  id: string,
): Promise<{ deleted: boolean }> {
  const response = await fetch(`/api/admin/products/${id}`, jsonInit("DELETE"));
  return parseApiResponse(response);
}

export async function invalidateCatalogQueries(
  queryClient: QueryClient,
  product?: { id: string; slug: string },
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: catalogQueryKey.all }),
    queryClient.invalidateQueries({ queryKey: adminCatalogQueryKey.all }),
    ...(product
      ? [
          queryClient.invalidateQueries({
            queryKey: catalogQueryKey.product(product.id),
          }),
          queryClient.invalidateQueries({
            queryKey: catalogQueryKey.product(product.slug),
          }),
        ]
      : []),
  ]);
}
