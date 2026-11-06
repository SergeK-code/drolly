import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20261106144000_sync_default_address.sql",
);

describe("default address migration", () => {
  it("sets the default in one function under the signed-in user", () => {
    const sql = readFileSync(MIGRATION, "utf8");

    expect(sql).toContain(
      "create or replace function public.sync_default_customer_address",
    );
    expect(sql).toContain("security invoker");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("ADDRESS_NOT_FOUND");
    expect(sql).toContain("is_default = true");
    expect(sql).not.toContain("security definer");
    expect(sql).not.toContain("disable row level security");
  });
});
