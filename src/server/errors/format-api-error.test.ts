import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AppError } from "@/server/errors/app-error";
import { formatApiError } from "@/server/errors/format-api-error";

const REQUEST_ID = "11111111-1111-4111-8111-111111111111";

describe("formatApiError", () => {
  it("maps AppError to its public code, status and message", () => {
    const error = new AppError(
      "VALIDATION_ERROR",
      400,
      "The submitted data is invalid.",
      { fieldErrors: { email: ["Required"] } },
    );

    const result = formatApiError(error, REQUEST_ID);

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "The submitted data is invalid.",
        details: { fieldErrors: { email: ["Required"] } },
        requestId: REQUEST_ID,
      },
    });
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
    expect(result.body.error.requestId).toBe(REQUEST_ID);
    expect(result.body.error.details).toMatchObject({
      fieldErrors: { name: expect.any(Array) },
    });
  });

  it("hides unknown errors, stacks and database messages", () => {
    const error = new Error('relation "orders" does not exist');
    error.stack = "Error: relation \"orders\" does not exist\n    at secret.ts:1:1";

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
