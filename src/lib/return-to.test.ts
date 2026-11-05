import { describe, expect, it } from "vitest";
import {
  defaultPathForRole,
  resolvePostAuthPath,
  sanitizeReturnTo,
  signInHref,
  withNotice,
} from "@/lib/return-to";

describe("sanitizeReturnTo", () => {
  it("accepts a same-origin relative path", () => {
    expect(sanitizeReturnTo("/account")).toBe("/account");
    expect(sanitizeReturnTo("/products/mint-tea")).toBe("/products/mint-tea");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(sanitizeReturnTo("//evil.example")).toBeNull();
    expect(sanitizeReturnTo("https://evil.example")).toBeNull();
    expect(sanitizeReturnTo("/\\evil.example")).toBeNull();
  });

  it("rejects auth and API paths that would loop", () => {
    expect(sanitizeReturnTo("/sign-in")).toBeNull();
    expect(sanitizeReturnTo("/sign-up")).toBeNull();
    expect(sanitizeReturnTo("/api/admin/me")).toBeNull();
  });
});

describe("resolvePostAuthPath", () => {
  it("uses the role default when returnTo is missing or unsafe", () => {
    expect(resolvePostAuthPath(undefined, "customer")).toBe("/account");
    expect(resolvePostAuthPath("//evil.example", "admin")).toBe("/admin");
    expect(defaultPathForRole("admin")).toBe("/admin");
  });

  it("does not send a customer to /admin even if returnTo asks for it", () => {
    expect(resolvePostAuthPath("/admin", "customer")).toBe("/account");
    expect(resolvePostAuthPath("/admin", "admin")).toBe("/admin");
  });

  it("honors a safe non-admin path for both roles", () => {
    expect(resolvePostAuthPath("/account", "admin")).toBe("/account");
    expect(resolvePostAuthPath("/products/tea", "customer")).toBe("/products/tea");
  });
});

describe("signInHref", () => {
  it("encodes the destination", () => {
    expect(signInHref("/admin")).toBe("/sign-in?returnTo=%2Fadmin");
  });
});

describe("withNotice", () => {
  it("appends a notice query to a path", () => {
    expect(withNotice("/account", "admin-only")).toBe(
      "/account?notice=admin-only",
    );
  });

  it("appends a notice query to an existing query string", () => {
    expect(withNotice(signInHref("/admin"), "signin-required")).toBe(
      "/sign-in?returnTo=%2Fadmin&notice=signin-required",
    );
  });
});
