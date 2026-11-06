import { describe, expect, it } from "vitest";
import { AppError } from "@/server/http/api";
import {
  addressIdSchema,
  checkoutBodySchema,
  rejectCheckoutPrivilegedFields,
} from "@/server/orders/schemas";

const productId = "11111111-1111-4111-8111-111111111111";
const addressId = "22222222-2222-4222-8222-222222222222";
const idempotencyKey = "33333333-3333-4333-8333-333333333333";

const valid = {
  idempotencyKey,
  items: [{ productId, quantity: 2 }],
  address: {
    recipientName: "Ada",
    phone: "0500000000",
    addressLine: "12 Market St",
    area: "Center",
  },
};

describe("addressIdSchema", () => {
  it("rejects an invalid id with an address message", () => {
    const parsed = addressIdSchema.safeParse("not-an-id");
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues[0]?.message).toBe("This address was not found.");
  });
});

describe("checkoutBodySchema", () => {
  it("accepts product ids, quantities and an address snapshot", () => {
    expect(checkoutBodySchema.parse(valid).items[0]?.quantity).toBe(2);
  });

  it("accepts a saved address id instead of a snapshot", () => {
    const parsed = checkoutBodySchema.parse({
      idempotencyKey,
      items: valid.items,
      addressId,
    });
    expect(parsed.addressId).toBe(addressId);
  });

  it("rejects client prices, totals, user id and status", () => {
    expect(() =>
      rejectCheckoutPrivilegedFields({
        ...valid,
        totalMinor: 1,
        userId: productId,
        status: "delivered",
      }),
    ).toThrow(AppError);
  });

  it("rejects an invalid phone with a field message", () => {
    const parsed = checkoutBodySchema.safeParse({
      ...valid,
      address: { ...valid.address, phone: "abc" },
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }
    expect(parsed.error.issues.some((issue) => issue.path.includes("phone"))).toBe(
      true,
    );
  });

  it("rejects both address sources, duplicate products and extra fields", () => {
    expect(
      checkoutBodySchema.safeParse({
        ...valid,
        addressId,
      }).success,
    ).toBe(false);
    expect(
      checkoutBodySchema.safeParse({
        ...valid,
        items: [
          { productId, quantity: 1 },
          { productId, quantity: 2 },
        ],
      }).success,
    ).toBe(false);
    expect(
      checkoutBodySchema.safeParse({
        ...valid,
        totalMinor: 999,
      }).success,
    ).toBe(false);
  });
});
