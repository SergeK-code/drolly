import { describe, expect, it } from "vitest";
import { shouldRefreshAuth } from "@/server/supabase/proxy-client";

describe("shouldRefreshAuth", () => {
  it("skips API routes because handlers already call getUser", () => {
    expect(shouldRefreshAuth("/api/admin/orders", ["sb-xxx-auth-token"])).toBe(
      false,
    );
  });

  it("skips page requests when there is no auth cookie", () => {
    expect(shouldRefreshAuth("/admin/orders", [])).toBe(false);
  });

  it("refreshes document requests that have a session cookie", () => {
    expect(
      shouldRefreshAuth("/admin/orders", ["sb-xxx-auth-token"]),
    ).toBe(true);
  });
});
