import { describe, expect, it } from "vitest";
import {
  catalogObjectPathSchema,
  sniffImageBytes,
} from "@/lib/image-upload";

function jpegHeader(): Uint8Array {
  return new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
}

function pngHeader(): Uint8Array {
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

describe("sniffImageBytes", () => {
  it("detects jpeg and png from magic bytes, not the file name", () => {
    expect(sniffImageBytes(jpegHeader())?.extension).toBe("jpg");
    expect(sniffImageBytes(pngHeader())?.extension).toBe("png");
    expect(sniffImageBytes(new Uint8Array([0x00, 0x01, 0x02]))).toBeNull();
  });
});

describe("catalogObjectPathSchema", () => {
  it("accepts generated object paths and rejects traversal", () => {
    expect(
      catalogObjectPathSchema.safeParse(
        "products/11111111-1111-4111-8111-111111111111.jpg",
      ).success,
    ).toBe(true);
    expect(catalogObjectPathSchema.safeParse("../secret.png").success).toBe(
      false,
    );
    expect(
      catalogObjectPathSchema.safeParse("products/../orders/x.jpg").success,
    ).toBe(false);
  });
});
