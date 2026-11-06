import { describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/http/api";
import type { PublicUser } from "@/server/auth/public-user";

const { getStoreSettings, updateStoreSettings, getDashboardSummary } =
  vi.hoisted(() => ({
    getStoreSettings: vi.fn(),
    updateStoreSettings: vi.fn(),
    getDashboardSummary: vi.fn(),
  }));

vi.mock("@/server/repositories/settings-repository", () => ({
  getStoreSettings,
  updateStoreSettings,
  getDashboardSummary,
}));

import {
  readAdminDashboard,
  readAdminStoreSettings,
  readPublicStoreSettings,
  writeAdminStoreSettings,
} from "@/server/services/settings-service";

const customer: PublicUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "c@example.com",
  fullName: "Customer",
  role: "customer",
};

const admin: PublicUser = {
  ...customer,
  role: "admin",
};

const settings = {
  storeName: "Drolly",
  contactPhone: null,
  contactEmail: null,
  currency: "USD",
  deliveryFeeMinor: 0,
  minimumOrderMinor: 0,
};

describe("settings-service", () => {
  it("lets anyone read the public settings subset", async () => {
    getStoreSettings.mockResolvedValue(settings);
    await expect(readPublicStoreSettings()).resolves.toEqual(settings);
  });

  it("lets only an admin update settings or read the dashboard", async () => {
    await expect(readAdminStoreSettings(customer)).rejects.toMatchObject({
      status: 403,
    });
    await expect(
      writeAdminStoreSettings(customer, settings),
    ).rejects.toBeInstanceOf(AppError);
    await expect(readAdminDashboard(null)).rejects.toMatchObject({
      status: 401,
    });
    expect(updateStoreSettings).not.toHaveBeenCalled();

    getStoreSettings.mockResolvedValue(settings);
    updateStoreSettings.mockResolvedValue(settings);
    getDashboardSummary.mockResolvedValue({
      categoryCount: 1,
      productCount: 2,
      orderCount: 3,
      pendingOrderCount: 1,
    });

    await expect(readAdminStoreSettings(admin)).resolves.toEqual(settings);
    await expect(writeAdminStoreSettings(admin, settings)).resolves.toEqual(
      settings,
    );
    await expect(readAdminDashboard(admin)).resolves.toMatchObject({
      orderCount: 3,
    });
  });
});
