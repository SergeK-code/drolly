import { getSession } from "@/server/controllers/auth-controller";
import { apiHandler } from "@/server/http/api-handler";

export const GET = apiHandler(async ({ requestId }) => {
  return getSession(requestId);
});
