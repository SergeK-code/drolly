import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/http/api";
import type { PublicUser } from "@/server/auth/public-user";

const { placeCodOrder, getOrderById } = vi.hoisted(() => ({
  placeCodOrder: vi.fn(),
  getOrderById: vi.fn(),
}));

vi.mock("@/server/repositories/order-repository", () => ({
  placeCodOrder,
  getOrderById,
}));

import { checkoutOrder } from "@/server/services/checkout-service";

const customer: PublicUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "c@example.com",
  fullName: "Customer",
  role: "customer",
};

const admin: PublicUser = {
  ...customer,
  role: "admin",
};

const input = {
  idempotencyKey: "33333333-3333-4333-8333-333333333333",
  items: [
    {
      productId: "22222222-2222-4222-8222-222222222222",
      quantity: 2,
    },
  ],
  addressId: "44444444-4444-4444-8444-444444444444",
};

describe("checkoutOrder", () => {
  beforeEach(() => {
    placeCodOrder.mockReset();
    getOrderById.mockReset();
  });

  it("rejects guests and admins", async () => {
    await expect(checkoutOrder(null, input)).rejects.toBeInstanceOf(AppError);
    await expect(checkoutOrder(admin, input)).rejects.toMatchObject({
      status: 403,
    });
    expect(placeCodOrder).not.toHaveBeenCalled();
  });

  it("sends only ids, quantities and address identity to the database", async () => {
    placeCodOrder.mockResolvedValue("order-1");
    getOrderById.mockResolvedValue({ id: "order-1", totalMinor: 1800 });

    await checkoutOrder(customer, input);

    expect(placeCodOrder).toHaveBeenCalledWith(input);
    expect(placeCodOrder.mock.calls[0]?.[0]).not.toHaveProperty("totalMinor");
  });
});
