import {
  patchAddress,
  removeAddress,
} from "@/server/controllers/address-controller";
import { apiHandler } from "@/server/http/api";

export const PATCH = apiHandler(async ({ request, requestId }) => {
  return patchAddress(request, requestId);
});

export const DELETE = apiHandler(async ({ request, requestId }) => {
  return removeAddress(request, requestId);
});
