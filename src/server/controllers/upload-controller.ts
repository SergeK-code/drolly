import "server-only";

import { assertSameOrigin } from "@/server/http/assert-same-origin";
import { jsonSuccess } from "@/server/http/api";
import { parseImageUpload } from "@/server/http/parse-request";
import { getClientIp } from "@/server/http/client-ip";
import { assertWithinRateLimit } from "@/server/http/rate-limit";
import { uploadAdminCatalogImage } from "@/server/services/upload-service";
import { uploadRateLimiter } from "@/server/uploads/upload-limiter";

export async function postCatalogImage(request: Request, requestId: string) {
  assertSameOrigin(request);
  assertWithinRateLimit(uploadRateLimiter, `upload:${getClientIp(request)}`);
  const { file, folder } = await parseImageUpload(request);
  const data = await uploadAdminCatalogImage(file, folder);
  return jsonSuccess(data, { status: 201, requestId });
}
