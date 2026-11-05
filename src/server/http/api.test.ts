import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppError, formatApiError } from "@/server/http/api";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";

describe("formatApiError", () => {
  it.each([
    [400, "VALIDATION_ERROR", "The submitted data is invalid."],
    [401, "UNAUTHENTICATED", "Sign in to continue."],
    [403, "FORBIDDEN", "You do not have permission to do this."],
    [404, "NOT_FOUND", "The requested resource was not found."],
    [409, "CONFLICT", "This value is already used."],
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
      expect(result.body.error).toMatchObject({
        code,
        message,
        requestId: REQUEST_ID,
      });
      expect(JSON.stringify(result.body)).not.toContain("internal or database");
    },
  );

  it("keeps field error details on AppError", () => {
    const error = new AppError(
      "VALIDATION_ERROR",
      400,
      "secret",
      { fieldErrors: { email: ["Required"] } },
    );

    const result = formatApiError(error, REQUEST_ID);

    expect(result.body.error.details).toEqual({
      fieldErrors: { email: ["Required"] },
    });
    expect(result.body.error.message).toBe("The submitted data is invalid.");
  });

  it("maps Zod errors to a validation envelope with a request ID", () => {
    const parsed = z.object({ name: z.string().min(1) }).safeParse({});
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const result = formatApiError(parsed.error, REQUEST_ID);

    expect(result.status).toBe(400);
    expect(result.body.error.code).toBe("VALIDATION_ERROR");
    expect(result.body.error.message).toBe("The submitted data is invalid.");
    expect(result.body.error.requestId).toBe(REQUEST_ID);
    expect(result.body.error.details).toMatchObject({
      fieldErrors: { name: expect.any(Array) },
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
