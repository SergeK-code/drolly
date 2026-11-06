import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20261106164500_customer_cancel_order.sql",
);

describe("customer cancel order migration", () => {
  it("creates an owner-only cancel function that restores stock", () => {
    const sql = readFileSync(MIGRATION, "utf8");

    expect(sql).toContain("create or replace function public.cancel_own_order");
    expect(sql).toContain("security definer");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("v_owner_id <> v_user_id");
    expect(sql).toContain("not in ('pending', 'confirmed')");
    expect(sql).toContain("for update of products");
    expect(sql).toContain(
      "stock_quantity = products.stock_quantity + v_line.quantity",
    );
    expect(sql).not.toContain("public.is_admin()");
    expect(sql).not.toContain("disable row level security");
    expect(sql).toContain(
      "grant execute on function public.cancel_own_order(uuid) to authenticated",
    );
  });
});
