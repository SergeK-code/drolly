import { describe, expect, it } from "vitest";
import { AppError } from "@/server/http/api";
import { getQueryParams, parseJsonBody } from "@/server/http/parse-request";

describe("parseJsonBody", () => {
  it("parses a JSON object", async () => {
    const request = new Request("http://localhost/api/example", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Ada" }),
    });

    await expect(parseJsonBody(request)).resolves.toEqual({ name: "Ada" });
  });

  it("rejects invalid JSON without exposing the raw body", async () => {
    const request = new Request("http://localhost/api/example", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    });

    await expect(parseJsonBody(request)).rejects.toBeInstanceOf(AppError);
  });
});

describe("getQueryParams", () => {
  it("reads query string values", () => {
    const request = new Request("http://localhost/api/products?q=tea&limit=10");
    expect(getQueryParams(request)).toEqual({ q: "tea", limit: "10" });
  });
});
