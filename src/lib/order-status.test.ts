import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ORDER_STATUSES,
  canCustomerCancelOrder,
  canTransitionOrderStatus,
  orderStatusName,
} from "@/lib/order-status";

describe("order status catalog", () => {
  it("matches the order_statuses seed in the database migration", () => {
    const sql = readFileSync(
      path.resolve(process.cwd(), "supabase/migrations/20261104120000_init_schema.sql"),
      "utf8",
    );

    for (const status of ORDER_STATUSES) {
      expect(sql).toContain(`'${status.code}', '${status.name}'`);
    }
  });

  it("uses the database names as labels", () => {
    expect(orderStatusName("out_for_delivery")).toBe("Out for delivery");
    expect(orderStatusName("cancelled")).toBe("Cancelled");
  });
});

describe("order status transitions", () => {
  it("lets an admin move to any other catalog status", () => {
    expect(canTransitionOrderStatus("pending", "delivered")).toBe(true);
    expect(canTransitionOrderStatus("delivered", "pending")).toBe(true);
    expect(canTransitionOrderStatus("cancelled", "confirmed")).toBe(true);
  });

  it("does not treat the current status as a change", () => {
    expect(canTransitionOrderStatus("preparing", "preparing")).toBe(false);
  });
});

describe("customer cancel", () => {
  it("allows pending and confirmed orders only", () => {
    expect(canCustomerCancelOrder("pending")).toBe(true);
    expect(canCustomerCancelOrder("confirmed")).toBe(true);
    expect(canCustomerCancelOrder("preparing")).toBe(false);
    expect(canCustomerCancelOrder("out_for_delivery")).toBe(false);
    expect(canCustomerCancelOrder("delivered")).toBe(false);
    expect(canCustomerCancelOrder("cancelled")).toBe(false);
  });
});
