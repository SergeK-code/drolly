import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/http/api";

const { requireAdminFromSession, uploadCatalogObject } = vi.hoisted(() => ({
  requireAdminFromSession: vi.fn(),
  uploadCatalogObject: vi.fn(),
}));

vi.mock("@/server/auth/protect", () => ({
  requireAdminFromSession,
}));

vi.mock("@/server/repositories/storage-repository", () => ({
  uploadCatalogObject,
}));

import { uploadAdminCatalogImage } from "@/server/services/upload-service";

function pngFile(): File {
  const bytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00,
  ]);
  return new File([bytes], "photo.exe", { type: "application/octet-stream" });
}

describe("uploadAdminCatalogImage", () => {
  beforeEach(() => {
    requireAdminFromSession.mockReset();
    uploadCatalogObject.mockReset();
  });

  it("rejects a customer", async () => {
    requireAdminFromSession.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "You do not have permission to do that."),
    );

    await expect(uploadAdminCatalogImage(pngFile(), "products")).rejects.toMatchObject({
      status: 403,
    });
    expect(uploadCatalogObject).not.toHaveBeenCalled();
  });

  it("stores a generated path after sniffing bytes", async () => {
    requireAdminFromSession.mockResolvedValue({ role: "admin" });
    uploadCatalogObject.mockImplementation(async ({ objectPath }: { objectPath: string }) => objectPath);

    const result = await uploadAdminCatalogImage(pngFile(), "products");
    expect(result.path).toMatch(/^products\/[0-9a-f-]{36}\.png$/);
    expect(uploadCatalogObject).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png",
      }),
    );
  });
});
