import { describe, expect, it } from "vitest";
import {
  catalogFiltersFromSearchParams,
  catalogHref,
} from "@/lib/ui/catalog-params";

describe("catalogFiltersFromSearchParams", () => {
  it("reads search, category slug and sort from the query string", () => {
    const params = new URLSearchParams(
      "q=mint&category=hot-drinks&sort=price-asc",
    );

    expect(catalogFiltersFromSearchParams(params)).toEqual({
      q: "mint",
      category: "hot-drinks",
      sort: "price-asc",
    });
  });

  it("ignores invalid category or sort values", () => {
    const params = new URLSearchParams("category=Hot&sort=cheap");

    expect(catalogFiltersFromSearchParams(params)).toEqual({
      q: "",
      category: undefined,
      sort: "newest",
    });
  });
});

describe("catalogHref", () => {
  it("omits default sort and empty search so / stays clean", () => {
    expect(
      catalogHref({ q: "", category: undefined, sort: "newest" }),
    ).toBe("/");
    expect(
      catalogHref({ q: "mint", category: "tea", sort: "name-desc" }),
    ).toBe("/?q=mint&category=tea&sort=name-desc");
  });
});
