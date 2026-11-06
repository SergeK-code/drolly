import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20261106151000_catalog_storage.sql",
);

describe("catalog storage migration", () => {
  it("creates a public-read catalog bucket with admin-only writes", () => {
    const sql = readFileSync(MIGRATION, "utf8");

    expect(sql).toContain("insert into storage.buckets");
    expect(sql).toContain("'catalog'");
    expect(sql).toContain("public.is_admin()");
    expect(sql).toContain("for insert");
    expect(sql).toContain("for select");
    expect(sql).not.toContain("service_role");
    expect(sql).not.toContain("disable row level security");
  });
});
