import {
  categorySlugSchema,
  productSortSchema,
  type ProductSort,
} from "@/lib/catalog-filters";

export type { ProductSort };

export type CatalogFilters = {
  q: string;
  category?: string;
  sort: ProductSort;
};

export function catalogFiltersFromSearchParams(
  params: Pick<URLSearchParams, "get">,
): CatalogFilters {
  const q = (params.get("q") ?? "").trim().slice(0, 80);
  const categoryResult = categorySlugSchema.safeParse(params.get("category") ?? "");
  const sortResult = productSortSchema.safeParse(params.get("sort") ?? "newest");

  return {
    q,
    category: categoryResult.success ? categoryResult.data : undefined,
    sort: sortResult.success ? sortResult.data : "newest",
  };
}

export function catalogHref(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  if (filters.q.length > 0) {
    params.set("q", filters.q);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();
  return query.length > 0 ? `/?${query}` : "/";
}
