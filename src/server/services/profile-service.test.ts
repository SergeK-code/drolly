import { describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/http/api";
import type { PublicUser } from "@/server/auth/public-user";

const { getProfileByUserId, updateOwnProfile } = vi.hoisted(() => ({
  getProfileByUserId: vi.fn(),
  updateOwnProfile: vi.fn(),
}));

vi.mock("@/server/repositories/profile-repository", () => ({
  getProfileByUserId,
  updateOwnProfile,
}));

import {
  getOwnProfile,
  rejectProfilePrivilegedFields,
  updateOwnProfileFields,
} from "@/server/services/profile-service";

const customer: PublicUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "c@example.com",
  fullName: "Customer",
  role: "customer",
};

describe("profile-service", () => {
  it("rejects guests", async () => {
    await expect(getOwnProfile(null)).rejects.toBeInstanceOf(AppError);
    await expect(
      updateOwnProfileFields(null, { fullName: "Ada", phone: null }),
    ).rejects.toMatchObject({ status: 401 });
    expect(updateOwnProfile).not.toHaveBeenCalled();
  });

  it("rejects role fields from the client", () => {
    expect(() =>
      rejectProfilePrivilegedFields({ fullName: "Ada", role: "admin" }),
    ).toThrow(AppError);
  });

  it("returns the signed-in user's profile", async () => {
    getProfileByUserId.mockResolvedValue({
      fullName: "Ada",
      phone: "0500000000",
      role: "customer",
    });

    await expect(getOwnProfile(customer)).resolves.toMatchObject({
      email: "c@example.com",
      fullName: "Ada",
      role: "customer",
    });
  });
});
