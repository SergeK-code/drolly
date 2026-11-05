import { AppError } from "@/server/http/api";

export async function parseJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "The submitted data is invalid.",
      { fieldErrors: { body: ["Expected a JSON body."] } },
    );
  }

  try {
    return await request.json();
  } catch {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      "The submitted data is invalid.",
      { fieldErrors: { body: ["Request body is not valid JSON."] } },
    );
  }
}

export function getQueryParams(request: Request): Record<string, string> {
  const params: Record<string, string> = {};
  const url = new URL(request.url);

  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
