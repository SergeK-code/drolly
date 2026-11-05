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
});
