import "server-only";

import type { PublicUser } from "@/server/auth/public-user";
import { requireAuthenticatedUser } from "@/server/auth/protect";
import {
  deleteAddress,
  insertAddress,
  listAddresses,
  updateAddress,
} from "@/server/repositories/address-repository";
import type { AddressWriteInput } from "@/server/orders/schemas";

export async function listCustomerAddresses(user: PublicUser | null) {
  const current = requireAuthenticatedUser(user);
  return listAddresses(current.id);
}

export async function createCustomerAddress(
  user: PublicUser | null,
  input: AddressWriteInput,
) {
  const current = requireAuthenticatedUser(user);
  return insertAddress(current.id, input);
}

export async function updateCustomerAddress(
  user: PublicUser | null,
  addressId: string,
  input: AddressWriteInput,
) {
  const current = requireAuthenticatedUser(user);
  return updateAddress(current.id, addressId, input);
}

export async function deleteCustomerAddress(
  user: PublicUser | null,
  addressId: string,
) {
  const current = requireAuthenticatedUser(user);
  await deleteAddress(current.id, addressId);
}
