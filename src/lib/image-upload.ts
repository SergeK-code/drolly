import { z } from "zod";

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const CATALOG_IMAGE_FOLDERS = ["products", "categories"] as const;

export type CatalogImageFolder = (typeof CATALOG_IMAGE_FOLDERS)[number];

export const catalogImageFolderSchema = z.enum(CATALOG_IMAGE_FOLDERS, {
  error: "Choose products or categories.",
});

export const catalogObjectPathSchema = z
  .string()
  .regex(
    /^(products|categories)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/i,
    "This image path is not valid.",
  );

export type SniffedImage = {
  extension: "jpg" | "png" | "webp";
  contentType: "image/jpeg" | "image/png" | "image/webp";
};

export function sniffImageBytes(bytes: Uint8Array): SniffedImage | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { extension: "jpg", contentType: "image/jpeg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { extension: "png", contentType: "image/png" };
  }

  const riff =
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46;
  const webp =
    riff &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;

  if (webp) {
    return { extension: "webp", contentType: "image/webp" };
  }

  return null;
}
