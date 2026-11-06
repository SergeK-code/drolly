import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/server/http/api";
import type { PublicUser } from "@/server/auth/public-user";

const { getOrderById, listOrders, updateOrderStatusRow } = vi.hoisted(() => ({
  getOrderById: vi.fn(),
  listOrders: vi.fn(),
  updateOrderStatusRow: vi.fn(),
}));

vi.mock("@/server/repositories/order-repository", () => ({
  getOrderById,
  listOrders,
  updateOrderStatusRow,
}));

import {
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
  });

  it("scopes the list to the signed-in customer", async () => {
    listOrders.mockResolvedValue({ items: [] });
    await listCustomerOrders(customer, { limit: 12 });
    expect(listOrders).toHaveBeenCalledWith(
      { limit: 12 },
      { userId: customer.id },
    );
  });

  it("does not let a customer change status", async () => {
    getOrderById.mockResolvedValue(order);
    await expect(
      updateAdminOrderStatus(customer, "order-1", "confirmed"),
    ).rejects.toMatchObject({ status: 403 });
    expect(updateOrderStatusRow).not.toHaveBeenCalled();
  });
});

describe("admin status updates", () => {
  beforeEach(() => {
    getOrderById.mockReset();
    updateOrderStatusRow.mockReset();
  });

  it("applies an allowed transition", async () => {
    getOrderById.mockResolvedValue(order);
    updateOrderStatusRow.mockResolvedValue({ ...order, status: "confirmed" });

    await updateAdminOrderStatus(admin, "order-1", "confirmed");

    expect(updateOrderStatusRow).toHaveBeenCalledWith({
      orderId: "order-1",
      fromStatus: "pending",
      toStatus: "confirmed",
    });
  });

  it("rejects a skip from pending to delivered", async () => {
    getOrderById.mockResolvedValue(order);
    await expect(
      updateAdminOrderStatus(admin, "order-1", "delivered"),
    ).rejects.toBeInstanceOf(AppError);
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
