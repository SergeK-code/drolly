import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/server/repositories/profile-repository", () => ({
  getProfileByUserId: vi.fn(),
}));

import { AppError } from "@/server/http/api";
import {
  requireAdmin,
  requireAuthenticatedUser,
  requireCustomer,
} from "@/server/auth/protect";
import type { PublicUser } from "@/server/auth/public-user";

const customer: PublicUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "customer@example.com",
  fullName: "Customer",
  role: "customer",
};

const admin: PublicUser = {
  ...customer,
  id: "22222222-2222-4222-8222-222222222222",
  email: "admin@example.com",
  fullName: "Admin",
  role: "admin",
};

describe("requireAuthenticatedUser", () => {
  it("rejects a guest and allows a signed-in user", () => {
    expect(() => requireAuthenticatedUser(null)).toThrow(AppError);
    expect(requireAuthenticatedUser(customer)).toEqual(customer);
  });
});

describe("requireAdmin", () => {
  it("allows an admin and rejects a customer", () => {
    expect(requireAdmin(admin)).toEqual(admin);
    expect(() => requireAdmin(customer)).toThrow(AppError);

    try {
      requireAdmin(customer);
    } catch (error) {
      expect(error).toMatchObject({ status: 403, code: "FORBIDDEN" });
    }
  });
});

describe("requireCustomer", () => {
  it("allows a customer and rejects an admin", () => {
    expect(requireCustomer(customer)).toEqual(customer);
    expect(() => requireCustomer(admin)).toThrow(AppError);
  });
});
