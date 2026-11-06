import { describe, expect, it } from "vitest";
import { headerLinks } from "@/lib/ui/header-links";

describe("headerLinks", () => {
  it("shows catalog and cart for guests", () => {
    expect(headerLinks(null).map((link) => link.label)).toEqual([
      "Catalog",
      "Cart",
    ]);
  });

  it("shows account but not admin for customers", () => {
    expect(headerLinks({ role: "customer" }).map((link) => link.label)).toEqual([
      "Catalog",
      "Cart",
      "Account",
    ]);
  });

  it("adds admin for administrators", () => {
    expect(headerLinks({ role: "admin" }).map((link) => link.href)).toEqual([
      "/",
      "/cart",
      "/account",
      "/admin",
    ]);
  });
});
