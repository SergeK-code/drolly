import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppError, formatApiError, validateData } from "@/server/http/api";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";

describe("formatApiError", () => {
  it.each([
    [400, "VALIDATION_ERROR", "The submitted data is invalid."],
    [401, "UNAUTHENTICATED", "Sign in to continue."],
    [403, "FORBIDDEN", "You do not have permission to do this."],
    [404, "NOT_FOUND", "The requested resource was not found."],
    [409, "CONFLICT", "This value is already used."],
    [422, "VALIDATION_ERROR", "Validation failed"],
    [429, "RATE_LIMITED", "Too many requests. Try again later."],
    [500, "DATABASE_ERROR", "An unexpected error occurred."],
  ] as const)(
    "maps AppError status %s to a dedicated public message",
    (status, code, message) => {
      const result = formatApiError(
        new AppError(code, status, "internal or database detail"),
        REQUEST_ID,
      );

      expect(result.status).toBe(status);
      expect(result.body).toEqual({
        success: false,
        error: { code, message, requestId: REQUEST_ID },
      });
      expect(JSON.stringify(result.body)).not.toContain("internal or database");
    },
  );

  it("includes field errors on AppError", () => {
    const error = new AppError("VALIDATION_ERROR", 422, "secret", {
      email: ["Required"],
    });

    const result = formatApiError(error, REQUEST_ID);

    expect(result.body.error.fieldErrors).toEqual({ email: ["Required"] });
    expect(result.body.error.message).toBe("Validation failed");
  });

  it("maps Zod errors to a validation envelope", () => {
    const parsed = z.object({ name: z.string().min(1) }).safeParse({});
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const result = formatApiError(parsed.error, REQUEST_ID);

    expect(result.status).toBe(422);
    expect(result.body.error.code).toBe("VALIDATION_ERROR");
    expect(result.body.error.message).toBe("Validation failed");
    expect(result.body.error.requestId).toBe(REQUEST_ID);
    expect(result.body.error.fieldErrors).toMatchObject({
      name: expect.any(Array),
    });
  });

  it("hides unknown errors, stacks and database messages", () => {
    const error = new Error('relation "orders" does not exist');
    error.stack =
      'Error: relation "orders" does not exist\n    at secret.ts:1:1';

    const result = formatApiError(error, REQUEST_ID);

    expect(result.status).toBe(500);
    expect(result.body.error.code).toBe("INTERNAL_ERROR");
    expect(result.body.error.message).toBe("An unexpected error occurred.");
    expect(result.body.error.requestId).toBe(REQUEST_ID);
    expect(JSON.stringify(result.body)).not.toContain("orders");
    expect(JSON.stringify(result.body)).not.toContain("secret.ts");
    expect(JSON.stringify(result.body)).not.toContain("stack");
  });
});

describe("validateData", () => {
  const schema = z
    .object({
      name: z.string().trim().min(1),
      limit: z.coerce.number().int().positive(),
    })
    .strict();

  it("returns cleaned data", () => {
    expect(validateData(schema, { name: "  Tea  ", limit: "12" })).toEqual({
      name: "Tea",
      limit: 12,
    });
  });

  it("throws AppError field errors for invalid input", () => {
    expect(() => validateData(schema, { name: "", extra: true })).toThrow(
      AppError,
    );

    try {
      validateData(schema, { name: "", extra: true });
    } catch (error) {
      expect(error).toMatchObject({
        code: "VALIDATION_ERROR",
        status: 422,
      });
      expect((error as AppError).fieldErrors).toMatchObject({
        name: expect.any(Array),
      });
    }
  });
});
