import { getEnv } from "@/lib/env";
import { AppError } from "@/server/http/api";

export function assertSameOrigin(request: Request): void {
  const allowedOrigin = new URL(getEnv().NEXT_PUBLIC_APP_URL).origin;
  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "This request is not allowed from that origin.",
    );
  }

  let requestOrigin: string;
  try {
    requestOrigin = new URL(originHeader).origin;
  } catch {
    throw new AppError(
      "FORBIDDEN",
      403,
      "This request is not allowed from that origin.",
    );
  }

  if (requestOrigin !== allowedOrigin) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "This request is not allowed from that origin.",
    );
  }
}
