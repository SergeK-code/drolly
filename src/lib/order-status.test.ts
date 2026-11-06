import { describe, expect, it } from "vitest";
import { canTransitionOrderStatus } from "@/lib/order-status";

describe("order status transitions", () => {
  it("allows the documented forward and cancel paths", () => {
    expect(canTransitionOrderStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionOrderStatus("pending", "cancelled")).toBe(true);
    expect(canTransitionOrderStatus("confirmed", "preparing")).toBe(true);
    expect(canTransitionOrderStatus("preparing", "out_for_delivery")).toBe(true);
    expect(canTransitionOrderStatus("out_for_delivery", "delivered")).toBe(true);
  });

  it("blocks skips, reverse moves and edits after delivery", () => {
    expect(canTransitionOrderStatus("pending", "delivered")).toBe(false);
    expect(canTransitionOrderStatus("delivered", "pending")).toBe(false);
    expect(canTransitionOrderStatus("cancelled", "confirmed")).toBe(false);
    expect(canTransitionOrderStatus("preparing", "cancelled")).toBe(false);
  });
});
