import { postCatalogImage } from "@/server/controllers/upload-controller";
import { apiHandler } from "@/server/http/api";

export const POST = apiHandler(async ({ request, requestId }) => {
  return postCatalogImage(request, requestId);
});
