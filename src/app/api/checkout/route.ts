import { postCheckout } from "@/server/controllers/checkout-controller";
import { apiHandler } from "@/server/http/api";

export const POST = apiHandler(async ({ request, requestId }) => {
  return postCheckout(request, requestId);
});
