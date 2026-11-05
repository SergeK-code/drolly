import { describe, expect, it } from "vitest";
import { adminNavItems } from "@/features/admin/admin-nav";

describe("adminNavItems", () => {
  it("lists the admin sections in drawer order", () => {
    expect(adminNavItems.map((item) => item.label)).toEqual([
      "Categories",
      "Products",
      "Orders",
      "Store settings",
    ]);
  });
});
