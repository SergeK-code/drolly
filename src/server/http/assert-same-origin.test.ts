import { afterEach, describe, expect, it } from "vitest";
import { AppError } from "@/server/http/api";
import { resetEnvCache } from "@/lib/env";
import { assertSameOrigin } from "@/server/http/assert-same-origin";

const ORIGINAL_URL = process.env.SUPABASE_URL;
const ORIGINAL_ANON = process.env.SUPABASE_ANON_KEY;
const ORIGINAL_APP = process.env.NEXT_PUBLIC_APP_URL;

afterEach(() => {
  restore("SUPABASE_URL", ORIGINAL_URL);
  restore("SUPABASE_ANON_KEY", ORIGINAL_ANON);
  restore("NEXT_PUBLIC_APP_URL", ORIGINAL_APP);
  resetEnvCache();
});

function restore(name: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

describe("assertSameOrigin", () => {
  it("allows the configured app origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon";
    resetEnvCache();

    const request = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { origin: "http://localhost:3000" },
    });

    expect(() => assertSameOrigin(request)).not.toThrow();
  });

  it("rejects a missing or foreign origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon";
    resetEnvCache();

    const missing = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
    });
    const foreign = new Request("http://localhost:3000/api/auth/sign-in", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });

    expect(() => assertSameOrigin(missing)).toThrow(AppError);
    expect(() => assertSameOrigin(foreign)).toThrow(AppError);
  });
});
