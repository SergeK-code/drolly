import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError, notFound } from "@/server/http/api";
import type { PublicUser } from "@/server/auth/public-user";

const { updateAddress, deleteAddress } = vi.hoisted(() => ({
  updateAddress: vi.fn(),
  deleteAddress: vi.fn(),
}));

vi.mock("@/server/repositories/address-repository", () => ({
  insertAddress: vi.fn(),
  listAddresses: vi.fn(),
  updateAddress,
  deleteAddress,
}));

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@/server/services/address-service";

const customer: PublicUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "c@example.com",
  fullName: "Customer",
  role: "customer",
};

const addressId = "22222222-2222-4222-8222-222222222222";
const input = {
  recipientName: "Ada",
  phone: "0500000000",
  addressLine: "12 Market St",
  area: "Center",
  notes: null,
  isDefault: false,
};

describe("address-service", () => {
  beforeEach(() => {
    updateAddress.mockReset();
    deleteAddress.mockReset();
  });

  it("scopes update and delete to the signed-in user", async () => {
    await expect(
      updateCustomerAddress(null, addressId, input),
    ).rejects.toBeInstanceOf(AppError);

    updateAddress.mockResolvedValue({ id: addressId, ...input });
    await updateCustomerAddress(customer, addressId, input);
    expect(updateAddress).toHaveBeenCalledWith(customer.id, addressId, input);

    await deleteCustomerAddress(customer, addressId);
    expect(deleteAddress).toHaveBeenCalledWith(customer.id, addressId);
  });

  it("does not use another user's id when the address belongs to someone else", async () => {
    const foreignAddressId = "99999999-9999-4999-8999-999999999999";
    updateAddress.mockRejectedValue(notFound("Address not found."));
    deleteAddress.mockRejectedValue(notFound("Address not found."));

    await expect(
      updateCustomerAddress(customer, foreignAddressId, input),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
    expect(updateAddress).toHaveBeenCalledWith(
      customer.id,
      foreignAddressId,
      input,
    );
    expect(updateAddress).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({ userId: expect.anything() }),
    );

    await expect(
      deleteCustomerAddress(customer, foreignAddressId),
    ).rejects.toMatchObject({ status: 404, code: "NOT_FOUND" });
    expect(deleteAddress).toHaveBeenCalledWith(customer.id, foreignAddressId);
  });
});
