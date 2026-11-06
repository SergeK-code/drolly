import "server-only";

import { getCurrentUser } from "@/server/auth/protect";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { jsonSuccess, validateData } from "@/server/http/api";
import { parseJsonBody } from "@/server/http/parse-request";
import { addressIdSchema, addressWriteSchema } from "@/server/orders/schemas";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  listCustomerAddresses,
  updateCustomerAddress,
} from "@/server/services/address-service";

export async function getAddresses(requestId: string) {
  const user = await getCurrentUser();
  const addresses = await listCustomerAddresses(user);
  return jsonSuccess({ addresses }, { requestId });
}

export async function postAddress(request: Request, requestId: string) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  const body = await parseJsonBody(request);
  const input = validateData(addressWriteSchema, body);
  const address = await createCustomerAddress(user, input);
  return jsonSuccess({ address }, { status: 201, requestId });
}

export async function patchAddress(request: Request, requestId: string) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  const addressId = validateData(addressIdSchema, lastPathSegment(request));
  const body = await parseJsonBody(request);
  const input = validateData(addressWriteSchema, body);
  const address = await updateCustomerAddress(user, addressId, input);
  return jsonSuccess({ address }, { requestId });
}

export async function removeAddress(request: Request, requestId: string) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  const addressId = validateData(addressIdSchema, lastPathSegment(request));
  await deleteCustomerAddress(user, addressId);
  return jsonSuccess({ deleted: true }, { requestId });
}

function lastPathSegment(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return decodeURIComponent(parts.at(-1) ?? "");
}
