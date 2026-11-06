import { getPublicStoreSettings } from "@/server/controllers/settings-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ requestId }) => {
  return getPublicStoreSettings(requestId);
});
