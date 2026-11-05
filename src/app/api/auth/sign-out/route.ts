import { signOut } from "@/server/controllers/auth-controller";
import { apiHandler } from "@/server/http/api";

export const POST = apiHandler(async ({ request, requestId }) => {
  return signOut(request, requestId);
});
