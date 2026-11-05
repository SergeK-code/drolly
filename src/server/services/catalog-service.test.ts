import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogProductRow } from "@/server/catalog/public";

const { listPublicProducts, getPublicProductByIdOrSlug } = vi.hoisted(() => ({
  listPublicProducts: vi.fn(),
  getPublicProductByIdOrSlug: vi.fn(),
}));

vi.mock("@/server/repositories/catalog-repository", () => ({
  listPublicProducts,
  getPublicProductByIdOrSlug,
  listPublicCategories: vi.fn(),
  getPublicCategoryBySlug: vi.fn(),
}));

import { productListQuerySchema } from "@/server/catalog/schemas";
import { getProduct, listProducts } from "@/server/services/catalog-service";

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
    description: null,
    priceMinor: 1500,
    currency: "USD",
    stockQuantity: 4,
    imagePath: null,
    isActive: true,
    createdAt: "2026-11-04T12:00:00.000Z",
    ...overrides,
  };
}

describe("listProducts", () => {
  beforeEach(() => {
    listPublicProducts.mockReset();
    getPublicProductByIdOrSlug.mockReset();
  });

  it("drops inactive rows even if the repository returned them", async () => {
    listPublicProducts.mockResolvedValue([
      productRow(),
      productRow({
        id: "33333333-3333-4333-8333-333333333333",
        isActive: false,
        slug: "hidden",
      }),
    ]);

    const result = await listProducts(productListQuerySchema.parse({ limit: 12 }));

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.slug).toBe("mint-tea");
    expect(result.hasMore).toBe(false);
  });

  it("returns hasMore and a next cursor when more than the limit exist", async () => {
    const rows = [
      productRow({
        id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        createdAt: "2026-11-04T12:00:03.000Z",
      }),
      productRow({
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        createdAt: "2026-11-04T12:00:02.000Z",
      }),
      productRow({
        id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        createdAt: "2026-11-04T12:00:01.000Z",
      }),
    ];
    listPublicProducts.mockResolvedValue(rows);

    const result = await listProducts(productListQuerySchema.parse({ limit: 2 }));

    expect(result.items.map((item) => item.id)).toEqual([
      rows[0]?.id,
      rows[1]?.id,
    ]);
    expect(result.hasMore).toBe(true);
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(result.page).toBeNull();
  });
});

describe("getProduct", () => {
  beforeEach(() => {
    getPublicProductByIdOrSlug.mockReset();
  });

  it("does not return an inactive product", async () => {
    getPublicProductByIdOrSlug.mockResolvedValue(
      productRow({ isActive: false }),
    );

    await expect(getProduct("mint-tea")).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
  });
});
