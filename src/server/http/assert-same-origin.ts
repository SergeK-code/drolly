import { getEnv } from "@/lib/server/env";
import { forbidden } from "@/server/http/api";

export function assertSameOrigin(request: Request): void {
  const allowedOrigin = new URL(getEnv().NEXT_PUBLIC_APP_URL).origin;
  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    throw forbidden("This request is not allowed from that origin.");
  }

  let requestOrigin: string;
  try {
    requestOrigin = new URL(originHeader).origin;
  } catch {
    throw forbidden("This request is not allowed from that origin.");
  }

  if (requestOrigin !== allowedOrigin) {
    throw forbidden("This request is not allowed from that origin.");
  }
}
