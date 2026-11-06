import { beforeEach, describe, expect, it, vi } from "vitest";

const { signUp, ensureCustomerProfile } = vi.hoisted(() => ({
  signUp: vi.fn(),
  ensureCustomerProfile: vi.fn(),
}));

vi.mock("@/server/supabase/server-client", () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signUp,
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  })),
}));

vi.mock("@/server/repositories/profile-repository", () => ({
  ensureCustomerProfile,
  getProfileByUserId: vi.fn(),
}));

import { registerUser } from "@/server/services/auth-service";

describe("registerUser", () => {
  beforeEach(() => {
    signUp.mockReset();
    ensureCustomerProfile.mockReset();
  });

  it("creates a customer and never returns an admin role", async () => {
    signUp.mockResolvedValue({
      data: {
        user: { id: "user-1", email: "ada@example.com" },
        session: { access_token: "secret-token" },
      },
      error: null,
    });
    ensureCustomerProfile.mockResolvedValue({
      fullName: "Ada",
      role: "admin",
    });

    const result = await registerUser({
      fullName: "Ada",
      email: "ada@example.com",
      password: "password1",
    });

    expect(signUp).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password1",
      options: { data: { full_name: "Ada" } },
    });
    expect(result.user?.role).toBe("customer");
    expect(JSON.stringify(result)).not.toContain("secret-token");
    expect(JSON.stringify(result)).not.toContain("access_token");
  });
});
