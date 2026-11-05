import { describe, expect, it } from "vitest";
import { catalogQueryKey } from "@/features/catalog/query-keys";

describe("catalogQueryKey", () => {
  it("nests list filters and product slugs under a shared catalog prefix", () => {
    const filters = { q: "mint", category: "tea", sort: "newest" };

    expect(catalogQueryKey.products(filters)).toEqual([
      "catalog",
      "products",
      filters,
    ]);
    expect(catalogQueryKey.product("mint-tea")).toEqual([
      "catalog",
      "product",
      "mint-tea",
    ]);
    expect(catalogQueryKey.categories()[0]).toBe(catalogQueryKey.all[0]);
  });
});
