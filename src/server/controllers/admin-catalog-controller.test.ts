import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/http/api";
import { resetEnvCache } from "@/lib/server/env";

const {
  createAdminCategory,
  updateAdminCategory,
  createAdminProduct,
  getAdminProduct,
  deleteAdminCategory,
} = vi.hoisted(() => ({
  createAdminCategory: vi.fn(),
  updateAdminCategory: vi.fn(),
  createAdminProduct: vi.fn(),
  getAdminProduct: vi.fn(),
  deleteAdminCategory: vi.fn(),
}));

vi.mock("@/server/services/admin-catalog-service", () => ({
  createAdminProduct,
  getAdminProduct,
  listAdminCategoryPage: vi.fn(),
  createAdminCategory,
  getAdminCategory: vi.fn(),
  updateAdminCategory,
  setAdminCategoryActive: vi.fn(),
  deleteAdminCategory,
  listAdminProductPage: vi.fn(),
  updateAdminProduct: vi.fn(),
  setAdminProductActive: vi.fn(),
  deleteAdminProduct: vi.fn(),
}));

import {
  createCategory,
  createProduct,
  deleteCategory,
  getProduct,
  patchCategory,
} from "@/server/controllers/admin-catalog-controller";

const ORIGINAL_URL = process.env.SUPABASE_URL;
const ORIGINAL_ANON = process.env.SUPABASE_ANON_KEY;
const ORIGINAL_APP = process.env.NEXT_PUBLIC_APP_URL;

const validBody = {
  name: "Mint tea",
  categoryId: "22222222-2222-4222-8222-222222222222",
  priceMinor: 1500,
  currency: "USD",
  stockQuantity: 4,
};

function restore(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_ANON_KEY = "anon";
  resetEnvCache();
  createAdminCategory.mockReset();
  updateAdminCategory.mockReset();
  createAdminProduct.mockReset();
  getAdminProduct.mockReset();
  deleteAdminCategory.mockReset();
});

afterEach(() => {
  restore("SUPABASE_URL", ORIGINAL_URL);
  restore("SUPABASE_ANON_KEY", ORIGINAL_ANON);
  restore("NEXT_PUBLIC_APP_URL", ORIGINAL_APP);
  resetEnvCache();
});

describe("createProduct", () => {
  it("creates a product when the body is valid", async () => {
    createAdminProduct.mockResolvedValue({ id: "p1" });
    const request = new Request("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify(validBody),
    });

    const response = await createProduct(request, "req_ok");
    expect(response.status).toBe(201);
    expect(createAdminProduct).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Mint tea", currency: "USD" }),
    );
  });

  it("rejects privileged fields", async () => {
    const request = new Request("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...validBody, isActive: true, slug: "mint-tea" }),
    });

    await expect(createProduct(request, "req_1")).rejects.toBeInstanceOf(
      AppError,
    );
    expect(createAdminProduct).not.toHaveBeenCalled();
  });

  it("rejects invalid currency and negative stock", async () => {
    const request = new Request("http://localhost:3000/api/admin/products", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        ...validBody,
        currency: "US",
        stockQuantity: -1,
      }),
    });

    await expect(createProduct(request, "req_2")).rejects.toMatchObject({
      name: "AppError",
    });
    expect(createAdminProduct).not.toHaveBeenCalled();
  });
});

describe("getProduct", () => {
  it("parses the product id from the path", async () => {
    const id = "11111111-1111-4111-8111-111111111111";
    getAdminProduct.mockResolvedValue({ id });
    const request = new Request(`http://localhost:3000/api/admin/products/${id}`);

    await getProduct(request, "req_3");
    expect(getAdminProduct).toHaveBeenCalledWith(id);
  });
});

describe("createCategory", () => {
  it("lets AppError bubble to the shared API handler", async () => {
    const conflict = new AppError("CONFLICT", 409, "duplicate key");
    createAdminCategory.mockRejectedValue(conflict);
    const request = new Request("http://localhost:3000/api/admin/categories", {
      method: "POST",
      headers: {
        origin: "http://localhost:3000",
        "content-type": "application/json",
      },
      body: JSON.stringify({ name: "Tea", sortOrder: 0 }),
    });

    await expect(createCategory(request, "req_cat")).rejects.toBe(conflict);
  });
});

describe("patchCategory", () => {
  it("lets AppError bubble to the shared API handler", async () => {
    const id = "33333333-3333-4333-8333-333333333333";
    const conflict = new AppError("CONFLICT", 409, "duplicate key");
    updateAdminCategory.mockRejectedValue(conflict);
    const request = new Request(
      `http://localhost:3000/api/admin/categories/${id}`,
      {
        method: "PATCH",
        headers: {
          origin: "http://localhost:3000",
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: "Tea", sortOrder: 0 }),
      },
    );

    await expect(patchCategory(request, "req_cat_2")).rejects.toBe(conflict);
  });
});

describe("deleteCategory", () => {
  it("parses the category id and requires the same origin", async () => {
    const id = "33333333-3333-4333-8333-333333333333";
    deleteAdminCategory.mockResolvedValue(undefined);
    const request = new Request(
      `http://localhost:3000/api/admin/categories/${id}`,
      {
        method: "DELETE",
        headers: { origin: "http://localhost:3000" },
      },
    );

    await deleteCategory(request, "req_4");
    expect(deleteAdminCategory).toHaveBeenCalledWith(id);
  });
});
