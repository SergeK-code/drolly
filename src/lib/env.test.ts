import { afterEach, describe, expect, it } from "vitest";
import { AppError } from "@/server/errors/app-error";
import { getEnv, resetEnvCache } from "@/lib/env";

const ORIGINAL_URL = process.env.SUPABASE_URL;
const ORIGINAL_ANON = process.env.SUPABASE_ANON_KEY;
const ORIGINAL_APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const ORIGINAL_SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ORIGINAL_LOG = process.env.LOG_LEVEL;

afterEach(() => {
  restore("SUPABASE_URL", ORIGINAL_URL);
  restore("SUPABASE_ANON_KEY", ORIGINAL_ANON);
  restore("NEXT_PUBLIC_APP_URL", ORIGINAL_APP_URL);
  restore("SUPABASE_SERVICE_ROLE_KEY", ORIGINAL_SERVICE);
  restore("LOG_LEVEL", ORIGINAL_LOG);
  resetEnvCache();
});

function restore(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

describe("getEnv", () => {
  it("returns validated values", () => {
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_ANON_KEY = "anon-key";
    process.env.LOG_LEVEL = "info";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    resetEnvCache();

    expect(getEnv()).toMatchObject({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    });
  });

  it("throws a safe configuration error when required values are missing", () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    resetEnvCache();

    expect(() => getEnv()).toThrow(AppError);
    try {
      getEnv();
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      if (error instanceof AppError) {
        expect(error.code).toBe("CONFIGURATION_ERROR");
        expect(error.message).not.toContain("SUPABASE");
      }
    }
  });
});
