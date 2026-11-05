import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { invalidateCatalogQueries } from "@/features/admin-catalog/api";
import { catalogQueryKey } from "@/features/catalog/query-keys";
import { adminCatalogQueryKey } from "@/features/admin-catalog/query-keys";

describe("invalidateCatalogQueries", () => {
  it("marks catalog lists, the product detail, and admin catalog stale", async () => {
    const queryClient = new QueryClient();
    const product = { id: "11111111-1111-4111-8111-111111111111", slug: "mint-tea" };

    queryClient.setQueryData(catalogQueryKey.products({ q: "" }), { items: [] });
    queryClient.setQueryData(catalogQueryKey.product(product.slug), {
      product: { slug: product.slug },
    });
    queryClient.setQueryData(adminCatalogQueryKey.products(), { items: [] });

    await invalidateCatalogQueries(queryClient, product);

    expect(
      queryClient.getQueryState(catalogQueryKey.products({ q: "" }))?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(catalogQueryKey.product(product.slug))
        ?.isInvalidated,
    ).toBe(true);
    expect(
      queryClient.getQueryState(adminCatalogQueryKey.products())?.isInvalidated,
    ).toBe(true);
  });
});
