import "server-only";

import { requireAdminFromSession } from "@/server/auth/protect";
import { uploadCatalogObject } from "@/server/repositories/storage-repository";
import { validatedUploadBytes } from "@/server/uploads/image";

export async function uploadAdminCatalogImage(
  file: File,
  folderValue: unknown,
): Promise<{ path: string }> {
  await requireAdminFromSession();
  const prepared = await validatedUploadBytes(file, folderValue);
  const path = await uploadCatalogObject({
    objectPath: prepared.objectPath,
    bytes: prepared.bytes,
    contentType: prepared.contentType,
  });
  return { path };
}
