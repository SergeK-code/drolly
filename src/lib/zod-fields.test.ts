import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  fieldErrorsFromZod,
  flattenFieldErrors,
  messageFromFieldErrors,
  validateForm,
} from "@/lib/zod-fields";
import { signInSchema } from "@/lib/auth-schemas";

describe("fieldErrorsFromZod", () => {
  it("maps Zod issues onto field names", () => {
    const parsed = z
      .object({ email: z.string().min(1, "Enter your email address.") })
      .safeParse({ email: "" });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    expect(fieldErrorsFromZod(parsed.error)).toEqual({
      email: ["Enter your email address."],
    });
  });

  it("copies nested paths onto the leaf field name", () => {
    expect(
      flattenFieldErrors({
        "address.phone": ["Enter a phone number."],
      }),
    ).toMatchObject({
      phone: ["Enter a phone number."],
      "address.phone": ["Enter a phone number."],
    });
  });
});

describe("messageFromFieldErrors", () => {
  it("joins unique field messages", () => {
    expect(
      messageFromFieldErrors({
        phone: ["Enter a valid phone number."],
        "address.phone": ["Enter a valid phone number."],
      }),
    ).toBe("Enter a valid phone number.");
  });
});

describe("validateForm", () => {
  it("returns sign-in Zod messages without calling the API", () => {
    const result = validateForm(signInSchema, {
      email: "not-an-email",
      password: "",
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.fieldErrors.email?.[0]).toBe("Enter a valid email address.");
    expect(result.fieldErrors.password?.[0]).toBe("Enter your password.");
  });
});
