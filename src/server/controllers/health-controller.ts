import "server-only";

import { jsonSuccess } from "@/server/http/json";
import { getHealth } from "@/server/services/health-service";

export async function getHealthResponse(requestId: string) {
  const data = await getHealth();
  return jsonSuccess(data, { requestId });
}
