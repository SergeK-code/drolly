import { describe, expect, it } from "vitest";
import {
  isPublicCategoryRow,
  isPublicProductRow,
  sanitizeSearchTerm,
  toPublicProduct,
  type CatalogProductRow,
} from "@/server/catalog/public";

function productRow(
  overrides: Partial<CatalogProductRow> = {},
): CatalogProductRow {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    categoryId: "22222222-2222-4222-8222-222222222222",
    categoryName: "Tea",
    categorySlug: "tea",
    categoryIsActive: true,
    name: "Mint tea",
    slug: "mint-tea",
    description: "Fresh mint",
    priceMinor: 1500,
    currency: "USD",
    stockQuantity: 4,
    imagePath: null,
    isActive: true,
    createdAt: "2026-11-04T12:00:00.000Z",
    ...overrides,
  };
}

describe("public catalog mapping", () => {
  it("hides inactive products and products in inactive categories", () => {
    expect(isPublicProductRow(productRow({ isActive: false }))).toBe(false);
    expect(
      isPublicProductRow(productRow({ categoryIsActive: false })),
    ).toBe(false);
    expect(isPublicProductRow(productRow())).toBe(true);
  });

  it("hides inactive categories", () => {
    expect(
      isPublicCategoryRow({
        id: "22222222-2222-4222-8222-222222222222",
        name: "Tea",
        slug: "tea",
        description: null,
        imagePath: null,
        isActive: false,
        sortOrder: 1,
      }),
    ).toBe(false);
  });

  it("omits admin-only fields from the public product", () => {
    const json = JSON.stringify(toPublicProduct(productRow()));
    expect(json).not.toContain("isActive");
    expect(json).not.toContain("is_active");
    expect(json).not.toContain("createdAt");
    expect(json).not.toContain("categoryIsActive");
  });

  it("strips wildcard characters so search stays a database filter", () => {
    expect(sanitizeSearchTerm("%mint_tea%")).toBe("mint tea");
    expect(sanitizeSearchTerm("   ")).toBeUndefined();
  });
});
