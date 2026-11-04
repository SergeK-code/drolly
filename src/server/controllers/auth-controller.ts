import "server-only";

import {
  readAdminSession,
  readSession,
  registerUser,
  signInUser,
  signOutUser,
} from "@/server/auth/auth-service";
import { authRateLimiter } from "@/server/auth/auth-limiter";
import {
  registerSchema,
  rejectClientRoleFields,
  signInSchema,
} from "@/server/auth/schemas";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { getClientIp } from "@/server/http/client-ip";
import { jsonSuccess } from "@/server/http/json";
import { parseJsonBody } from "@/server/http/parse-request";
import { assertWithinRateLimit } from "@/server/http/rate-limit";

export async function register(request: Request, requestId: string) {
  assertSameOrigin(request);
  assertWithinRateLimit(authRateLimiter, `register:${getClientIp(request)}`);

  const body = await parseJsonBody(request);
  rejectClientRoleFields(body);
  const input = registerSchema.parse(body);
  const data = await registerUser(input);

  return jsonSuccess(data, { status: 201, requestId });
}

export async function signIn(request: Request, requestId: string) {
  assertSameOrigin(request);
  assertWithinRateLimit(authRateLimiter, `sign-in:${getClientIp(request)}`);

  const body = await parseJsonBody(request);
  const input = signInSchema.parse(body);
  const data = await signInUser(input);

  return jsonSuccess(data, { requestId });
}

export async function signOut(request: Request, requestId: string) {
  assertSameOrigin(request);
  await signOutUser();
  return jsonSuccess({ signedOut: true }, { requestId });
}

export async function getSession(requestId: string) {
  const data = await readSession();
  return jsonSuccess(data, { requestId });
}

export async function getAdminMe(requestId: string) {
  const data = await readAdminSession();
  return jsonSuccess(data, { requestId });
}
