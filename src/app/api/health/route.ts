import { apiHandler } from "@/server/http/api";
import { getHealthResponse } from "@/server/controllers/health-controller";

export const GET = apiHandler(async ({ requestId }) => {
  return getHealthResponse(requestId);
});
