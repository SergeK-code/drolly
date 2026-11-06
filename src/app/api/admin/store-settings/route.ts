import {
  getAdminStoreSettings,
  patchAdminStoreSettings,
} from "@/server/controllers/settings-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ requestId }) => {
  return getAdminStoreSettings(requestId);
});

export const PATCH = apiHandler(async ({ request, requestId }) => {
  return patchAdminStoreSettings(request, requestId);
});
