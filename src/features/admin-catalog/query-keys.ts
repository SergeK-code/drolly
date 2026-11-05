export const adminCatalogQueryKey = {
  all: ["admin-catalog"] as const,
  categories: () => [...adminCatalogQueryKey.all, "categories"] as const,
  category: (id: string) =>
    [...adminCatalogQueryKey.all, "category", id] as const,
  products: () => [...adminCatalogQueryKey.all, "products"] as const,
  product: (id: string) => [...adminCatalogQueryKey.all, "product", id] as const,
};
