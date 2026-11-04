import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@/server/errors/format-api-error";

export function jsonSuccess<T>(
  data: T,
  options: { status?: number; requestId: string },
): NextResponse {
  return NextResponse.json(
    { success: true as const, data },
    {
      status: options.status ?? 200,
      headers: { "x-request-id": options.requestId },
    },
  );
}

export function jsonError(
  body: ApiErrorBody,
  status: number,
  requestId: string,
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { "x-request-id": requestId },
  });
}
