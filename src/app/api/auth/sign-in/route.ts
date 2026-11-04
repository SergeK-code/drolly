import { signIn } from "@/server/controllers/auth-controller";
import { apiHandler } from "@/server/http/api-handler";

export const POST = apiHandler(async ({ request, requestId }) => {
  return signIn(request, requestId);
});
