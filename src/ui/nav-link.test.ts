import { describe, expect, it } from "vitest";
import { navLinkIsActive } from "@/ui/nav-link";

describe("navLinkIsActive", () => {
  it("matches home only exactly", () => {
    expect(navLinkIsActive("/", "/", "exact")).toBe(true);
    expect(navLinkIsActive("/products/tea", "/", "exact")).toBe(false);
    expect(navLinkIsActive("/products/tea", "/", "prefix")).toBe(false);
  });

  it("keeps section items active on child routes", () => {
    expect(navLinkIsActive("/account", "/account", "prefix")).toBe(true);
    expect(navLinkIsActive("/account/orders/1", "/account", "prefix")).toBe(
      true,
    );
    expect(navLinkIsActive("/account/orders", "/account/orders", "prefix")).toBe(
      true,
    );
    expect(navLinkIsActive("/account", "/account/orders", "prefix")).toBe(false);
  });

  it("uses exact match for profile vs nested account pages", () => {
    expect(navLinkIsActive("/account", "/account", "exact")).toBe(true);
    expect(navLinkIsActive("/account/addresses", "/account", "exact")).toBe(
      false,
    );
  });
});
