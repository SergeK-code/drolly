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
    async (status, code, message) => {
      const response = formatApiError(
        new AppError(code, status, "internal or database detail"),
        REQUEST_ID,
      );
      const body = await response.json();

      expect(response.status).toBe(status);
      expect(response.headers.get("x-request-id")).toBe(REQUEST_ID);
      expect(body).toEqual({
        success: false,
        error: { code, message, requestId: REQUEST_ID },
      });
      expect(JSON.stringify(body)).not.toContain("internal or database");
    },
  );

  it("includes field errors on AppError", async () => {
    const error = new AppError("VALIDATION_ERROR", 422, "secret", {
      email: ["Required"],
    });

    const body = await formatApiError(error, REQUEST_ID).json();

    expect(body.error.fieldErrors).toEqual({ email: ["Required"] });
    expect(body.error.message).toBe("Validation failed");
  });

  it("maps Zod errors to a validation envelope", async () => {
    const parsed = z.object({ name: z.string().min(1) }).safeParse({});
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const response = formatApiError(parsed.error, REQUEST_ID);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(body.error.message).toBe("Validation failed");
    expect(body.error.requestId).toBe(REQUEST_ID);
    expect(body.error.fieldErrors).toMatchObject({
      name: expect.any(Array),
    });
  });

  it("hides unknown errors, stacks and database messages", async () => {
    const error = new Error('relation "orders" does not exist');
    error.stack =
      'Error: relation "orders" does not exist\n    at secret.ts:1:1';

    const response = formatApiError(error, REQUEST_ID);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(body.error.message).toBe("An unexpected error occurred.");
    expect(body.error.requestId).toBe(REQUEST_ID);
    expect(JSON.stringify(body)).not.toContain("orders");
    expect(JSON.stringify(body)).not.toContain("secret.ts");
    expect(JSON.stringify(body)).not.toContain("stack");
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
