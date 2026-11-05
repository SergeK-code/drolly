import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/http/api";

vi.mock("@/server/repositories/health-repository", () => ({
  assertStoreSettingsReadable: vi.fn(),
}));

import { assertStoreSettingsReadable } from "@/server/repositories/health-repository";
import { getHealth } from "@/server/services/health-service";

describe("getHealth", () => {
  beforeEach(() => {
    vi.mocked(assertStoreSettingsReadable).mockReset();
  });

  it("returns ok when the database check succeeds", async () => {
    vi.mocked(assertStoreSettingsReadable).mockResolvedValue(undefined);
    await expect(getHealth()).resolves.toEqual({ status: "ok" });
  });

  it("returns degraded when configuration or database checks fail", async () => {
    vi.mocked(assertStoreSettingsReadable).mockRejectedValue(
      new AppError(
        "CONFIGURATION_ERROR",
        500,
        "The service is temporarily unavailable.",
      ),
    );

    await expect(getHealth()).resolves.toEqual({ status: "degraded" });
  });

  it("does not swallow unexpected errors", async () => {
    vi.mocked(assertStoreSettingsReadable).mockRejectedValue(
      new Error("boom"),
    );

    await expect(getHealth()).rejects.toThrow("boom");
  });
});
