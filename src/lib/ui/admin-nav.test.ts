import { describe, expect, it } from "vitest";
import { adminNavItems } from "@/lib/ui/admin-nav";

describe("adminNavItems", () => {
  it("lists the admin sections in drawer order", () => {
    expect(adminNavItems.map((item) => item.label)).toEqual([
      "Dashboard",
      "Categories",
      "Products",
      "Orders",
      "Store settings",
    ]);
  });
});
