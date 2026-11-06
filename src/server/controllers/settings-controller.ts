import "server-only";

import { getCurrentUser } from "@/server/auth/protect";
import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { jsonSuccess, validateData } from "@/server/http/api";
import { parseJsonBody } from "@/server/http/parse-request";
import { storeSettingsWriteSchema } from "@/lib/store-settings-schema";
import {
  readAdminDashboard,
  readAdminStoreSettings,
  readPublicStoreSettings,
  rejectSettingsPrivilegedFields,
  writeAdminStoreSettings,
} from "@/server/services/settings-service";

export async function getPublicStoreSettings(requestId: string) {
  const settings = await readPublicStoreSettings();
  return jsonSuccess({ settings }, { requestId });
}

export async function getAdminStoreSettings(requestId: string) {
  const user = await getCurrentUser();
  const settings = await readAdminStoreSettings(user);
  return jsonSuccess({ settings }, { requestId });
}

export async function patchAdminStoreSettings(
  request: Request,
  requestId: string,
) {
  assertSameOrigin(request);
  const user = await getCurrentUser();
  const body = await parseJsonBody(request);
  rejectSettingsPrivilegedFields(body);
  const input = validateData(storeSettingsWriteSchema, body);
  const settings = await writeAdminStoreSettings(user, input);
  return jsonSuccess({ settings }, { requestId });
}

export async function getAdminDashboard(requestId: string) {
  const user = await getCurrentUser();
  const dashboard = await readAdminDashboard(user);
  return jsonSuccess({ dashboard }, { requestId });
}
