import { describe, expect, it } from "vitest";
import {
  categoryListQuerySchema,
  categorySlugSchema,
  productIdOrSlugSchema,
  productListQuerySchema,
  slugFromName,
} from "@/server/catalog/schemas";

describe("productListQuerySchema", () => {
  it("applies a default limit and ignores empty search", () => {
    const parsed = productListQuerySchema.parse({});
    expect(parsed.limit).toBe(12);
    expect(parsed.q).toBeUndefined();
    expect(parsed.sort).toBe("newest");
  });

  it("accepts a sort query", () => {
    expect(productListQuerySchema.parse({ sort: "price-desc" }).sort).toBe(
      "price-desc",
    );
  });

  it("rejects an unknown sort", () => {
    expect(productListQuerySchema.safeParse({ sort: "cheap" }).success).toBe(
      false,
    );
  });

  it("rejects a limit above the maximum", () => {
    const result = productListQuerySchema.safeParse({ limit: "100" });
    expect(result.success).toBe(false);
  });

  it("rejects cursor and page together", () => {
    const result = productListQuerySchema.safeParse({
      cursor: "abc",
      page: "2",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid categoryId", () => {
    const result = productListQuerySchema.safeParse({ categoryId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects unknown query keys", () => {
    const result = productListQuerySchema.safeParse({ extra: "1" });
    expect(result.success).toBe(false);
  });
});

describe("categoryListQuerySchema", () => {
  it("coerces limit from a query string", () => {
    expect(categoryListQuerySchema.parse({ limit: "8" }).limit).toBe(8);
  });
});

describe("path schemas", () => {
  it("accepts a category slug", () => {
    expect(categorySlugSchema.parse("hot-drinks")).toBe("hot-drinks");
  });

  it("rejects an uppercase slug", () => {
    expect(categorySlugSchema.safeParse("Hot").success).toBe(false);
  });

  it("accepts a product id or slug string", () => {
    expect(productIdOrSlugSchema.parse("mint-tea").length).toBeGreaterThan(0);
  });
});

describe("slugFromName", () => {
  it("builds a lowercase hyphenated slug from the name", () => {
    expect(slugFromName("Mint tea")).toBe("mint-tea");
    expect(slugFromName("  Hot  Drinks ")).toBe("hot-drinks");
  });

  it("falls back when the name has no letters or numbers", () => {
    expect(slugFromName("!!!")).toBe("item");
  });
});
