import "server-only";

import type { PublicUser } from "@/server/auth/public-user";
import { requireAuthenticatedUser } from "@/server/auth/protect";
import {
  insertAddress,
  listAddresses,
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
