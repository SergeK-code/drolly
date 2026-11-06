import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnvCache } from "@/lib/env";

const { uploadAdminCatalogImage } = vi.hoisted(() => ({
  uploadAdminCatalogImage: vi.fn(),
}));

vi.mock("@/server/services/upload-service", () => ({
  uploadAdminCatalogImage,
}));

import { postCatalogImage } from "@/server/controllers/upload-controller";

beforeEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_ANON_KEY = "anon";
  resetEnvCache();
  uploadAdminCatalogImage.mockReset();
});

describe("postCatalogImage", () => {
  it("requires the same origin", async () => {
    const body = new FormData();
    body.set("file", new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "a.png"));
    body.set("folder", "products");
    const request = new Request("http://localhost:3000/api/admin/uploads", {
      method: "POST",
      body,
    });

    await expect(postCatalogImage(request, "req_1")).rejects.toMatchObject({
      status: 403,
    });
    expect(uploadAdminCatalogImage).not.toHaveBeenCalled();
  });
});
