import "server-only";

import { getCurrentUser } from "@/server/auth/protect";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { getClientIp } from "@/server/http/client-ip";
import { jsonSuccess, validateData } from "@/server/http/api";
import { parseJsonBody } from "@/server/http/parse-request";
import { assertWithinRateLimit } from "@/server/http/rate-limit";
import { checkoutRateLimiter } from "@/server/orders/checkout-limiter";
import {
  checkoutBodySchema,
  rejectCheckoutPrivilegedFields,
} from "@/server/orders/schemas";
import { checkoutOrder } from "@/server/services/checkout-service";

export async function postCheckout(request: Request, requestId: string) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  assertWithinRateLimit(
    checkoutRateLimiter,
    `${user?.id ?? getClientIp(request)}:checkout`,
  );
  const body = await parseJsonBody(request);
  rejectCheckoutPrivilegedFields(body);
  const input = validateData(checkoutBodySchema, body);
  const order = await checkoutOrder(user, input);
  return jsonSuccess({ order }, { status: 201, requestId });
}
