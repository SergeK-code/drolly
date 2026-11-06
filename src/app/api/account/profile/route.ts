import { getProfile, patchProfile } from "@/server/controllers/profile-controller";
import { apiHandler } from "@/server/http/api";

export const GET = apiHandler(async ({ requestId }) => {
  return getProfile(requestId);
});

export const PATCH = apiHandler(async ({ request, requestId }) => {
  return patchProfile(request, requestId);
});
