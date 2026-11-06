import "server-only";

import { getCurrentUser } from "@/server/auth/protect";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { jsonSuccess, validateData } from "@/server/http/api";
import { parseJsonBody } from "@/server/http/parse-request";
import { profileWriteSchema } from "@/lib/profile-schema";
import {
  getOwnProfile,
  rejectProfilePrivilegedFields,
  updateOwnProfileFields,
} from "@/server/services/profile-service";

export async function getProfile(requestId: string) {
  const user = await getCurrentUser();
  const profile = await getOwnProfile(user);
  return jsonSuccess({ profile }, { requestId });
}

export async function patchProfile(request: Request, requestId: string) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  const body = await parseJsonBody(request);
  rejectProfilePrivilegedFields(body);
  const input = validateData(profileWriteSchema, body);
  const profile = await updateOwnProfileFields(user, input);
  return jsonSuccess({ profile }, { requestId });
}
