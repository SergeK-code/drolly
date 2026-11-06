import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20261106163000_cancel_restores_stock.sql",
);

describe("cancel restores stock migration", () => {
  it("creates an atomic admin status function that restores stock on cancel", () => {
    const sql = readFileSync(MIGRATION, "utf8");

    expect(sql).toContain("create or replace function public.update_order_status");
    expect(sql).toContain("security definer");
    expect(sql).toContain("public.is_admin()");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("for update of products");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("p_to_status = 'cancelled'");
    expect(sql).toContain(
      "stock_quantity = products.stock_quantity + v_line.quantity",
    );
    expect(sql).toContain(
      "stock_quantity = products.stock_quantity - v_line.quantity",
    );
    expect(sql).not.toContain("disable row level security");
    expect(sql).toContain(
      "grant execute on function public.update_order_status(uuid, text, text) to authenticated",
    );
  });
});
