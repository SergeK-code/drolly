import "server-only";

import {
  catalogImageFolderSchema,
  catalogObjectPathSchema,
  MAX_IMAGE_BYTES,
  sniffImageBytes,
  type CatalogImageFolder,
} from "@/lib/image-upload";
import { validateData, validationFailed } from "@/server/http/api";

export function catalogObjectPathFromParts(parts: string[]): string {
  return validateDataPath(parts.join("/"));
}

export function validateDataPath(value: string): string {
  const normalized = value.replaceAll("\\", "/").replace(/^\/+/, "");
  if (normalized.includes("..")) {
    throw validationFailed({
      file: ["This image path is not valid."],
    });
  }

  const parsed = catalogObjectPathSchema.safeParse(normalized);
  if (!parsed.success) {
    throw validationFailed({
      file: ["This image path is not valid."],
    });
  }

  return parsed.data;
}

export async function validatedUploadBytes(
  file: File,
  folderValue: unknown,
): Promise<{
  folder: CatalogImageFolder;
  bytes: Uint8Array;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  objectPath: string;
}> {
  const folder = validateData(catalogImageFolderSchema, folderValue);

  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
    throw validationFailed({
      file: ["Choose a JPG, PNG or WebP image under 2 MB."],
    });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImageBytes(bytes);

  if (!sniffed) {
    throw validationFailed({
      file: ["Choose a JPG, PNG or WebP image."],
    });
  }

  const objectPath = `${folder}/${crypto.randomUUID()}.${sniffed.extension}`;

  return {
    folder,
    bytes,
    contentType: sniffed.contentType,
    objectPath,
  };
}
