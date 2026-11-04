import { describe, expect, it } from "vitest";
import { getRequestId } from "@/server/http/request-id";

describe("getRequestId", () => {
  it("reuses a valid incoming x-request-id", () => {
    const requestId = "22222222-2222-4222-8222-222222222222";
    const request = new Request("http://localhost/api/health", {
      headers: { "x-request-id": requestId },
    });

    expect(getRequestId(request)).toBe(requestId);
  });

  it("generates a UUID when the header is missing or unsafe", () => {
    const missing = new Request("http://localhost/api/health");
    const unsafe = new Request("http://localhost/api/health", {
      headers: { "x-request-id": "not-a-uuid" },
    });

    expect(getRequestId(missing)).toMatch(
      /^[0-9a-f-]{36}$/i,
    );
    expect(getRequestId(unsafe)).not.toBe("not-a-uuid");
  });
});
