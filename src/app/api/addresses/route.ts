import { getAddresses, postAddress } from "@/server/controllers/address-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ requestId }) => {
  return getAddresses(requestId);
});

export const POST = apiHandler(async ({ request, requestId }) => {
  return postAddress(request, requestId);
});
