import { describe, expect, it } from "vitest";
import { AppError } from "@/server/http/api";
import {
  adminActiveSchema,
  adminCategoryWriteSchema,
  adminProductWriteSchema,
  rejectPrivilegedCatalogFields,
} from "@/server/catalog/admin-schemas";

describe("adminProductWriteSchema", () => {
  const valid = {
    name: "Mint tea",
    description: null,
    categoryId: "22222222-2222-4222-8222-222222222222",
    priceMinor: 1500,
    currency: "usd",
    stockQuantity: 4,
  };

  it("uppercases currency and accepts zero price and stock", () => {
    const parsed = adminProductWriteSchema.parse({
      ...valid,
      priceMinor: 0,
      stockQuantity: 0,
    });
    expect(parsed.currency).toBe("USD");
  });

  it("rejects negative prices and stock", () => {
    expect(
      adminProductWriteSchema.safeParse({ ...valid, priceMinor: -1 }).success,
    ).toBe(false);
    expect(
      adminProductWriteSchema.safeParse({ ...valid, stockQuantity: -1 }).success,
    ).toBe(false);
  });

  it("rejects an invalid currency code", () => {
    expect(
      adminProductWriteSchema.safeParse({ ...valid, currency: "US" }).success,
    ).toBe(false);
  });
});

describe("adminCategoryWriteSchema", () => {
  it("rejects names that are too long", () => {
    expect(
      adminCategoryWriteSchema.safeParse({
        name: "a".repeat(81),
      }).success,
    ).toBe(false);
  });
});

describe("adminActiveSchema", () => {
  it("accepts an isActive boolean", () => {
    expect(adminActiveSchema.parse({ isActive: true })).toEqual({
      isActive: true,
    });
    expect(adminActiveSchema.safeParse({ isActive: "yes" }).success).toBe(false);
  });
});

describe("rejectPrivilegedCatalogFields", () => {
  it("rejects role and stockAdjustment from the client", () => {
    expect(() => rejectPrivilegedCatalogFields({ role: "admin" })).toThrow(
      AppError,
    );
    expect(() =>
      rejectPrivilegedCatalogFields({ stockAdjustment: 5 }),
    ).toThrow(AppError);
    expect(() => rejectPrivilegedCatalogFields({ slug: "mint-tea" })).toThrow(
      AppError,
    );
  });
});
