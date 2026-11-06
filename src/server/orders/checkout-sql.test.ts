import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20261106130600_checkout.sql",
);

describe("checkout migration", () => {
  it("creates an atomic checkout function with stock locks and idempotency", () => {
    const sql = readFileSync(MIGRATION, "utf8");

    expect(sql).toContain("create table public.checkout_attempts");
    expect(sql).toContain(
      "alter table public.checkout_attempts enable row level security",
    );
    expect(sql).toContain("create or replace function public.place_cod_order");
    expect(sql).toContain("security definer");
    expect(sql).toContain("auth.uid()");
    expect(sql).toContain("for update of products");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("cash_on_delivery");
    expect(sql).toContain("stock_quantity = products.stock_quantity -");
    expect(sql).not.toContain("disable row level security");
  });
});

describe("checkout skip-minimum migration", () => {
  it("replaces place_cod_order without enforcing the stored minimum", () => {
    const sql = readFileSync(
      path.resolve(
        process.cwd(),
        "supabase/migrations/20261106161600_checkout_skip_minimum.sql",
      ),
      "utf8",
    );

    expect(sql).toContain("create or replace function public.place_cod_order");
    expect(sql).not.toContain("CHECKOUT_MINIMUM");
    expect(sql).not.toContain("v_subtotal < v_minimum");
    expect(sql).toContain("minimum_order_minor");
  });
});
