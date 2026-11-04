import { describe, expect, it } from "vitest";
import { AppError } from "@/server/errors/app-error";
import {
  registerSchema,
  rejectClientRoleFields,
  signInSchema,
} from "@/server/auth/schemas";

describe("registerSchema", () => {
  it("accepts name, email and password", () => {
    expect(
      registerSchema.parse({
        fullName: "Ada Lovelace",
        email: "ada@example.com",
        password: "password1",
      }),
    ).toEqual({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "password1",
    });
  });

  it("rejects a client-supplied role before parsing", () => {
    expect(() =>
      rejectClientRoleFields({
        fullName: "Ada",
        email: "ada@example.com",
        password: "password1",
        role: "admin",
      }),
    ).toThrow(AppError);

    expect(() =>
      rejectClientRoleFields({
        fullName: "Ada",
        email: "ada@example.com",
        password: "password1",
        role_id: 2,
      }),
    ).toThrow(AppError);
  });

  it("rejects unknown fields such as role_id", () => {
    const parsed = registerSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "password1",
      role_id: 2,
    });

    expect(parsed.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("requires email and password", () => {
    expect(signInSchema.safeParse({ email: "ada@example.com" }).success).toBe(
      false,
    );
  });
});
