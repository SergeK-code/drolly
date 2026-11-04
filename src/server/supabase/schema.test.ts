import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = path.resolve(
  process.cwd(),
  "supabase/migrations/20261104120000_init_schema.sql",
);

const APPLICATION_TABLES = [
  "app_roles",
  "profiles",
  "categories",
  "products",
  "customer_addresses",
  "order_statuses",
  "orders",
  "order_items",
  "store_settings",
] as const;

function readMigration(): string {
  return readFileSync(MIGRATION, "utf8");
}

describe("database foundation migration", () => {
  it("creates every application table", () => {
    const sql = readMigration();

    for (const table of APPLICATION_TABLES) {
      expect(sql).toContain(`create table public.${table}`);
    }
  });

  it("enables RLS on every application table", () => {
    const sql = readMigration();

    for (const table of APPLICATION_TABLES) {
      expect(sql).toContain(
        `alter table public.${table} enable row level security`,
      );
    }

    expect(sql.toLowerCase()).not.toContain("disable row level security");
  });

  it("seeds roles, order statuses and store settings", () => {
    const sql = readMigration();

    expect(sql).toContain("'customer'");
    expect(sql).toContain("'admin'");
    expect(sql).toContain("'pending'");
    expect(sql).toContain("'confirmed'");
    expect(sql).toContain("'preparing'");
    expect(sql).toContain("'out_for_delivery'");
    expect(sql).toContain("'delivered'");
    expect(sql).toContain("'cancelled'");
    expect(sql).toContain("insert into public.store_settings");
  });

  it("keeps money as integer minor units with non-negative checks", () => {
    const sql = readMigration();

    expect(sql).toContain("price_minor integer");
    expect(sql).toContain("products_price_non_negative");
    expect(sql).toContain("products_stock_non_negative");
    expect(sql).toContain("orders_total_non_negative");
    expect(sql).toContain("order_items_quantity_positive");
    expect(sql).not.toMatch(/price_minor\s+(real|double|numeric|float)/i);
  });

  it("forces new auth users onto the customer role", () => {
    const sql = readMigration();

    expect(sql).toContain("handle_new_user");
    expect(sql).toContain("on_auth_user_created");
    expect(sql).toContain("enforce_profile_role_rules");
    expect(sql).toContain("where code = 'customer'");
  });

  it("resolves admin access from a trusted role lookup", () => {
    const sql = readMigration();

    expect(sql).toContain("create or replace function public.is_admin()");
    expect(sql).toContain("app_roles.code = 'admin'");
    expect(sql).not.toContain("request.jwt.claims ->> 'role'");
  });
});
