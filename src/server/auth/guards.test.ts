import { describe, expect, it } from "vitest";
import { AppError } from "@/server/errors/app-error";
import { requireAdmin, requireAuthenticatedUser } from "@/server/auth/guards";
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

describe("auth guards", () => {
  it("rejects a guest", () => {
    expect(() => requireAuthenticatedUser(null)).toThrow(AppError);
    try {
      requireAuthenticatedUser(null);
    } catch (error) {
      expect(error).toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
    }
  });

  it("allows a customer but not an admin API", () => {
    expect(requireAuthenticatedUser(customer)).toEqual(customer);
    expect(() => requireAdmin(customer)).toThrow(AppError);
    try {
      requireAdmin(customer);
    } catch (error) {
      expect(error).toMatchObject({ status: 403, code: "FORBIDDEN" });
    }
  });

  it("allows an admin", () => {
    expect(requireAdmin(admin)).toEqual(admin);
  });
});
