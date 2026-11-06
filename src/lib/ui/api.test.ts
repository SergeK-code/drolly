import { describe, expect, it } from "vitest";
import { ApiError, explainApiError, parseApiResponse } from "@/lib/ui/api";

describe("parseApiResponse", () => {
  it("returns data when success is true", async () => {
    const response = new Response(
      JSON.stringify({ success: true, data: { ok: true } }),
      { status: 200, headers: { "content-type": "application/json" } },
    );

    await expect(parseApiResponse<{ ok: boolean }>(response)).resolves.toEqual({
      ok: true,
    });
  });

  it("throws the server message and field errors", async () => {
    const response = new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Enter your email address.",
          fieldErrors: { email: ["Required"] },
        },
      }),
      { status: 422, headers: { "content-type": "application/json" } },
    );

    await expect(parseApiResponse(response)).rejects.toMatchObject({
      name: "ApiError",
      message: "Enter your email address.",
      code: "VALIDATION_ERROR",
      fieldErrors: { email: ["Required"] },
    });
  });

  it("maps field errors into a readable submit message", () => {
    expect(
      explainApiError(
        new ApiError("Check the highlighted fields and try again.", {
          code: "VALIDATION_ERROR",
          fieldErrors: { phone: ["Enter a valid phone number."] },
        }),
      ),
    ).toEqual({
      fieldErrors: { phone: ["Enter a valid phone number."] },
      message: "Enter a valid phone number.",
    });
  });

  it("throws a generic message for invalid JSON", async () => {
    const response = new Response("nope", { status: 500 });

    await expect(parseApiResponse(response)).rejects.toBeInstanceOf(ApiError);
  });
});
