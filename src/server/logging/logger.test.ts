import { Writable } from "node:stream";
import { describe, expect, it } from "vitest";
import { AppError } from "@/server/http/api";
import { createLogger, safeErrorContext } from "@/server/logging/logger";

describe("logger redaction", () => {
  it("redacts secrets and does not keep raw password values", async () => {
    const lines: string[] = [];
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        lines.push(String(chunk));
        callback();
      },
    });

    const log = createLogger(destination);
    log.info(
      {
        password: "super-secret-password",
        token: "header.payload.sig",
        cookie: "sb-access-token=abc",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-value",
      },
      "auth attempt",
    );

    await new Promise((resolve) => setImmediate(resolve));
    const output = lines.join("");

    expect(output).toContain("[Redacted]");
    expect(output).not.toContain("super-secret-password");
    expect(output).not.toContain("header.payload.sig");
    expect(output).not.toContain("service-role-value");
    expect(output).not.toContain("sb-access-token=abc");
  });
});

describe("safeErrorContext", () => {
  it("keeps the error message so logs show what happened", () => {
    const error = new AppError(
      "CONFLICT",
      409,
      "duplicate key value violates unique constraint",
    );

    expect(safeErrorContext(error)).toEqual({
      name: "AppError",
      message: "duplicate key value violates unique constraint",
      code: "CONFLICT",
      status: 409,
    });
  });
});
