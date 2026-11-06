import { describe, expect, it } from "vitest";
import type { PublicUser } from "@/features/auth/api";

function authFromQuery(query: {
  data?: { user: PublicUser | null };
  isPending: boolean;
}): { status: string; hasUser: boolean } {
  if (query.data) {
    const user = query.data.user;
    return {
      hasUser: Boolean(user),
      status: user ? "authenticated" : "unauthenticated",
    };
  }

  if (query.isPending) {
    return { hasUser: false, status: "loading" };
  }

  return { hasUser: false, status: "unauthenticated" };
}

describe("auth status mapping", () => {
  it("stays loading until a session payload exists", () => {
    expect(authFromQuery({ isPending: true })).toEqual({
      hasUser: false,
      status: "loading",
    });
  });

  it("does not treat a loaded guest as loading", () => {
    expect(authFromQuery({ isPending: false, data: { user: null } })).toEqual({
      hasUser: false,
      status: "unauthenticated",
    });
  });

  it("treats a loaded user as authenticated", () => {
    expect(
      authFromQuery({
        isPending: false,
        data: {
          user: {
            id: "1",
            email: "a@b.c",
            fullName: "Ada",
            role: "customer",
          },
        },
      }),
    ).toEqual({ hasUser: true, status: "authenticated" });
  });
});
