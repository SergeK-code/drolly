import { describe, expect, it } from "vitest";
import { catalogImageUrl } from "@/lib/catalog-media";

describe("catalogImageUrl", () => {
  it("keeps an http image path", () => {
    expect(catalogImageUrl("tea", "https://cdn.example.com/tea.jpg")).toBe(
      "https://cdn.example.com/tea.jpg",
    );
  });

  it("returns a stable placeholder for the same seed", () => {
    expect(catalogImageUrl("mint-tea")).toBe(catalogImageUrl("mint-tea"));
  });

  it("maps a stored object path to the media route", () => {
    expect(
      catalogImageUrl(
        "mint-tea",
        "products/11111111-1111-4111-8111-111111111111.jpg",
      ),
    ).toBe("/api/media/products/11111111-1111-4111-8111-111111111111.jpg");
  });
});
