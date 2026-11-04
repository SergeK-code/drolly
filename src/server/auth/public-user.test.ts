import { describe, expect, it } from "vitest";
import { toPublicUser } from "@/server/auth/public-user";

describe("toPublicUser", () => {
  it("returns only safe display fields", () => {
    const user = toPublicUser({
      id: "11111111-1111-4111-8111-111111111111",
      email: "ada@example.com",
      fullName: "Ada",
      role: "customer",
    });

    expect(user).toEqual({
      id: "11111111-1111-4111-8111-111111111111",
      email: "ada@example.com",
      fullName: "Ada",
      role: "customer",
    });
    expect(JSON.stringify(user)).not.toContain("access_token");
    expect(JSON.stringify(user)).not.toContain("refresh_token");
  });
});
