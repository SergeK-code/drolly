import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PublicUser } from "@/server/auth/public-user";

const { getOrderById, listOrders, updateOrderStatusRow, cancelOwnOrderRow } =
  vi.hoisted(() => ({
    getOrderById: vi.fn(),
    listOrders: vi.fn(),
    updateOrderStatusRow: vi.fn(),
    cancelOwnOrderRow: vi.fn(),
  }));

vi.mock("@/server/repositories/order-repository", () => ({
  getOrderById,
  listOrders,
  updateOrderStatusRow,
  cancelOwnOrderRow,
}));

import {
  cancelCustomerOrder,
  getCustomerOrder,
  listCustomerOrders,
  updateAdminOrderStatus,
} from "@/server/services/order-service";

const customer: PublicUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "c@example.com",
  fullName: "Customer",
  role: "customer",
};

const admin: PublicUser = {
  ...customer,
  id: "22222222-2222-4222-8222-222222222222",
  role: "admin",
};

const order = {
  id: "order-1",
  status: "pending" as const,
};

describe("customer orders", () => {
  beforeEach(() => {
    getOrderById.mockReset();
    listOrders.mockReset();
    updateOrderStatusRow.mockReset();
    cancelOwnOrderRow.mockReset();
  });

  it("scopes the list to the signed-in customer", async () => {
    listOrders.mockResolvedValue({ items: [] });
    await listCustomerOrders(customer, { limit: 12 });
    expect(listOrders).toHaveBeenCalledWith(
      { limit: 12 },
      { userId: customer.id },
    );
  });

  it("does not let a customer change status through the admin API", async () => {
    getOrderById.mockResolvedValue(order);
    await expect(
      updateAdminOrderStatus(customer, "order-1", "confirmed"),
    ).rejects.toMatchObject({ status: 403 });
    expect(updateOrderStatusRow).not.toHaveBeenCalled();
  });

  it("lets a customer cancel a pending order", async () => {
    getOrderById.mockResolvedValue(order);
    cancelOwnOrderRow.mockResolvedValue({ ...order, status: "cancelled" });

    await cancelCustomerOrder(customer, "order-1");

    expect(cancelOwnOrderRow).toHaveBeenCalledWith("order-1");
  });

  it("rejects customer cancel after the order is being prepared", async () => {
    getOrderById.mockResolvedValue({ ...order, status: "preparing" });
    await expect(cancelCustomerOrder(customer, "order-1")).rejects.toMatchObject({
      status: 409,
    });
    expect(cancelOwnOrderRow).not.toHaveBeenCalled();
  });

  it("does not let an admin use the customer cancel path", async () => {
    await expect(cancelCustomerOrder(admin, "order-1")).rejects.toMatchObject({
      status: 403,
    });
    expect(cancelOwnOrderRow).not.toHaveBeenCalled();
  });
});

describe("admin status updates", () => {
  beforeEach(() => {
    getOrderById.mockReset();
    updateOrderStatusRow.mockReset();
  });

  it("applies any catalog status", async () => {
    getOrderById.mockResolvedValue(order);
    updateOrderStatusRow.mockResolvedValue({ ...order, status: "delivered" });

    await updateAdminOrderStatus(admin, "order-1", "delivered");

    expect(updateOrderStatusRow).toHaveBeenCalledWith({
      orderId: "order-1",
      fromStatus: "pending",
      toStatus: "delivered",
    });
  });

  it("skips a no-op when the status is unchanged", async () => {
    getOrderById.mockResolvedValue(order);
    const result = await updateAdminOrderStatus(admin, "order-1", "pending");
    expect(result).toEqual(order);
    expect(updateOrderStatusRow).not.toHaveBeenCalled();
  });
});

describe("getCustomerOrder", () => {
  it("requires a session", async () => {
    await expect(getCustomerOrder(null, "order-1")).rejects.toMatchObject({
      status: 401,
    });
  });
});
