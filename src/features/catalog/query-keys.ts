export const catalogQueryKey = {
  all: ["catalog"] as const,
  categories: () => [...catalogQueryKey.all, "categories"] as const,
  products: (filters: { q: string; category?: string; sort?: string }) =>
    [...catalogQueryKey.all, "products", filters] as const,
  product: (slug: string) => [...catalogQueryKey.all, "product", slug] as const,
};
