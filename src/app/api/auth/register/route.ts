import { register } from "@/server/controllers/auth-controller";
import { apiHandler } from "@/server/http/api";

export const POST = apiHandler(async ({ request, requestId }) => {
  return register(request, requestId);
});
