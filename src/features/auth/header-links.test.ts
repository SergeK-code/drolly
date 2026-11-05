import { describe, expect, it } from "vitest";
import { headerLinks } from "@/features/auth/header-links";

describe("headerLinks", () => {
  it("shows catalog and auth entry points for guests", () => {
    expect(headerLinks(null).map((link) => link.label)).toEqual([
      "Catalog",
      "Sign in",
      "Create account",
    ]);
  });

  it("shows account but not admin for customers", () => {
    expect(headerLinks({ role: "customer" }).map((link) => link.label)).toEqual(
      ["Catalog", "Account"],
    );
  });

  it("adds admin for administrators", () => {
    expect(headerLinks({ role: "admin" }).map((link) => link.href)).toEqual([
      "/",
      "/account",
      "/admin",
    ]);
  });
});
