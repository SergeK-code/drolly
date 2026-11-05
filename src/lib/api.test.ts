import { describe, expect, it } from "vitest";
import { ApiError, parseApiResponse } from "@/lib/api";

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
          code: "VALIDATION",
          message: "Check the form.",
          details: { fieldErrors: { email: ["Required"] } },
        },
      }),
      { status: 422, headers: { "content-type": "application/json" } },
    );

    await expect(parseApiResponse(response)).rejects.toMatchObject({
      name: "ApiError",
      message: "Check the form.",
      code: "VALIDATION",
      fieldErrors: { email: ["Required"] },
    });
  });

  it("throws a generic message for invalid JSON", async () => {
    const response = new Response("nope", { status: 500 });

    await expect(parseApiResponse(response)).rejects.toBeInstanceOf(ApiError);
  });
});
