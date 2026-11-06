import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  requireAdminFromSession,
  insertProduct,
  findProductIdBySlug,
  getAdminCategoryById,
  getAdminProductById,
  setProductActive,
  countProductsForCategory,
  deleteCategory,
  deleteProduct,
} = vi.hoisted(() => ({
  requireAdminFromSession: vi.fn(),
  insertProduct: vi.fn(),
  findProductIdBySlug: vi.fn(),
  getAdminCategoryById: vi.fn(),
  getAdminProductById: vi.fn(),
  setProductActive: vi.fn(),
  countProductsForCategory: vi.fn(),
  deleteCategory: vi.fn(),
  deleteProduct: vi.fn(),
}));

vi.mock("@/server/auth/protect", () => ({
  requireAdminFromSession,
}));

vi.mock("@/server/repositories/catalog-repository", () => ({
  insertProduct,
  findProductIdBySlug,
  getAdminCategoryById,
  getAdminProductById,
  setProductActive,
  listAdminCategories: vi.fn(),
  listAdminProducts: vi.fn(),
  findCategoryIdBySlug: vi.fn(),
  insertCategory: vi.fn(),
  updateCategory: vi.fn(),
  updateProduct: vi.fn(),
  setCategoryActive: vi.fn(),
  countProductsForCategory,
  deleteCategory,
  deleteProduct,
}));

import {
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  setAdminProductActive,
} from "@/server/services/admin-catalog-service";
import { AppError } from "@/server/http/api";

const productInput = {
  name: "Mint tea",
  description: null,
  categoryId: "22222222-2222-4222-8222-222222222222",
  priceMinor: 1500,
  currency: "USD",
  stockQuantity: 4,
};

describe("createAdminProduct", () => {
  beforeEach(() => {
    requireAdminFromSession.mockReset();
    insertProduct.mockReset();
    findProductIdBySlug.mockReset();
    getAdminCategoryById.mockReset();
  });

  it("rejects guests", async () => {
    requireAdminFromSession.mockRejectedValue(
      new AppError("UNAUTHENTICATED", 401, "You need to sign in."),
    );
    await expect(createAdminProduct(productInput)).rejects.toMatchObject({
      status: 401,
    });
    expect(insertProduct).not.toHaveBeenCalled();
  });

  it("rejects customers", async () => {
    requireAdminFromSession.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "You do not have permission to do that."),
    );
    await expect(createAdminProduct(productInput)).rejects.toMatchObject({
      status: 403,
    });
    expect(insertProduct).not.toHaveBeenCalled();
  });

  it("rejects a missing category", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    getAdminCategoryById.mockResolvedValue(null);

    await expect(createAdminProduct(productInput)).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      status: 422,
    });
    expect(insertProduct).not.toHaveBeenCalled();
  });

  it("generates a unique slug from the name", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    getAdminCategoryById.mockResolvedValue({ id: productInput.categoryId });
    findProductIdBySlug.mockImplementation(async (slug: string) =>
      slug === "mint-tea" ? "existing-id" : null,
    );
    insertProduct.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      categoryId: productInput.categoryId,
      categoryName: "Tea",
      categorySlug: "tea",
      categoryIsActive: true,
      name: "Mint tea",
      slug: "mint-tea-2",
      description: null,
      priceMinor: 1500,
      currency: "USD",
      stockQuantity: 4,
      imagePath: null,
      isActive: true,
      createdAt: "2026-11-04T12:00:00.000Z",
    });

    await createAdminProduct(productInput);
    expect(insertProduct).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "mint-tea-2" }),
    );
  });

  it("creates an active product for an admin", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    getAdminCategoryById.mockResolvedValue({
      id: productInput.categoryId,
      isActive: true,
    });
    findProductIdBySlug.mockResolvedValue(null);
    insertProduct.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      categoryId: productInput.categoryId,
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
    });

    const product = await createAdminProduct(productInput);
    expect(product.isActive).toBe(true);
    expect(product.slug).toBe("mint-tea");
  });
});

describe("setAdminProductActive", () => {
  beforeEach(() => {
    requireAdminFromSession.mockReset();
    getAdminProductById.mockReset();
    setProductActive.mockReset();
  });

  it("activates and deactivates without deleting", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    getAdminProductById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
    });
    setProductActive.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      categoryId: productInput.categoryId,
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
      isActive: false,
      createdAt: "2026-11-04T12:00:00.000Z",
    });

    const product = await setAdminProductActive(
      "11111111-1111-4111-8111-111111111111",
      false,
    );
    expect(setProductActive).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      false,
    );
    expect(product.isActive).toBe(false);
  });
});

describe("deleteAdminProduct", () => {
  beforeEach(() => {
    requireAdminFromSession.mockReset();
    getAdminProductById.mockReset();
    deleteProduct.mockReset();
  });

  it("deletes a product after an admin check", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    getAdminProductById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
    });
    deleteProduct.mockResolvedValue(undefined);

    await deleteAdminProduct("11111111-1111-4111-8111-111111111111");
    expect(deleteProduct).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
    );
  });
});

const categoryId = "33333333-3333-4333-8333-333333333333";

describe("deleteAdminCategory", () => {
  beforeEach(() => {
    requireAdminFromSession.mockReset();
    getAdminCategoryById.mockReset();
    countProductsForCategory.mockReset();
    deleteCategory.mockReset();
  });

  it("rejects guests", async () => {
    requireAdminFromSession.mockRejectedValue(
      new AppError("UNAUTHENTICATED", 401, "You need to sign in."),
    );
    await expect(deleteAdminCategory(categoryId)).rejects.toMatchObject({
      status: 401,
    });
    expect(deleteCategory).not.toHaveBeenCalled();
  });

  it("deletes a category that has no products", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    getAdminCategoryById.mockResolvedValue({ id: categoryId, isActive: true });
    countProductsForCategory.mockResolvedValue(0);
    deleteCategory.mockResolvedValue(undefined);

    await deleteAdminCategory(categoryId);
    expect(countProductsForCategory).toHaveBeenCalledWith(categoryId);
    expect(deleteCategory).toHaveBeenCalledWith(categoryId);
  });

  it("does not delete a category that products still use", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    getAdminCategoryById.mockResolvedValue({ id: categoryId, isActive: true });
    countProductsForCategory.mockResolvedValue(2);

    await expect(deleteAdminCategory(categoryId)).rejects.toMatchObject({
      code: "CONFLICT",
      status: 409,
    });
    expect(deleteCategory).not.toHaveBeenCalled();
  });
});
