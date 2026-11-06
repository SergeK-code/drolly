import { postCancelOwnOrder } from "@/server/controllers/order-controller";
import { apiHandler } from "@/server/http/api";

export const POST = apiHandler(async ({ request, requestId }) => {
  return postCancelOwnOrder(request, requestId);
});
