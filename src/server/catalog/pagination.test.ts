import { describe, expect, it } from "vitest";
import { AppError } from "@/server/http/api";
import {
  decodeProductCursor,
  encodeCursor,
  pageOffset,
  splitPage,
} from "@/server/catalog/pagination";

describe("catalog pagination", () => {
  it("encodes and decodes a product cursor", () => {
    const cursor = {
      createdAt: "2026-11-04T12:00:00.000Z",
      id: "11111111-1111-4111-8111-111111111111",
    };

    expect(decodeProductCursor(encodeCursor(cursor))).toEqual(cursor);
  });

  it("rejects a tampered cursor", () => {
    expect(() => decodeProductCursor("not-valid")).toThrow(AppError);
  });

  it("splits a limit-plus-one page without duplicates", () => {
    const rows = [1, 2, 3, 4];
    expect(splitPage(rows, 3)).toEqual({ items: [1, 2, 3], hasMore: true });
    expect(splitPage([1, 2, 3], 3)).toEqual({
      items: [1, 2, 3],
      hasMore: false,
    });
  });

  it("computes a stable page offset", () => {
    expect(pageOffset(1, 12)).toBe(0);
    expect(pageOffset(3, 12)).toBe(24);
  });
});
