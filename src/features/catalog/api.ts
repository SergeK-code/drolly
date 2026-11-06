import { parseApiResponse } from "@/lib/ui/api";

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
};

export type PublicProduct = {
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
  imagePath: string | null;
};

export type PaginatedCatalog<T> = {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  page: number | null;
};

export async function fetchCategories(): Promise<PaginatedCatalog<PublicCategory>> {
  const params = new URLSearchParams({ limit: "24" });
  const response = await fetch(`/api/categories?${params.toString()}`, {
    credentials: "include",
  });

  return parseApiResponse(response);
}

export async function fetchProducts(input: {
  q?: string;
  category?: string;
  categoryId?: string;
  sort?: string;
  page?: number;
  cursor?: string;
  limit?: number;
}): Promise<PaginatedCatalog<PublicProduct>> {
  const params = new URLSearchParams();
  params.set("limit", String(input.limit ?? 12));

  if (input.q) {
    params.set("q", input.q);
  }

  if (input.category) {
    params.set("category", input.category);
  }

  if (input.categoryId) {
    params.set("categoryId", input.categoryId);
  }

  if (input.sort && input.sort !== "newest") {
    params.set("sort", input.sort);
  }

  if (input.page) {
    params.set("page", String(input.page));
  }

  if (input.cursor) {
    params.set("cursor", input.cursor);
  }

  const response = await fetch(`/api/products?${params.toString()}`, {
    credentials: "include",
  });

  return parseApiResponse(response);
}

export async function fetchProduct(
  idOrSlug: string,
): Promise<{ product: PublicProduct }> {
  const response = await fetch(`/api/products/${encodeURIComponent(idOrSlug)}`, {
    credentials: "include",
  });

  return parseApiResponse(response);
}
