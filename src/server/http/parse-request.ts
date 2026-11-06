import { validationFailed } from "@/server/http/api";

export async function parseJsonBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw validationFailed({ body: ["Expected a JSON body."] });
  }

  try {
    return await request.json();
  } catch {
    throw validationFailed({ body: ["Request body is not valid JSON."] });
  }
}

export async function parseImageUpload(
  request: Request,
): Promise<{ file: File; folder: unknown }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    throw validationFailed({ body: ["Expected a file upload."] });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    throw validationFailed({ body: ["The upload could not be read."] });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    throw validationFailed({ file: ["Choose an image file."] });
  }

  return { file, folder: form.get("folder") };
}

export function getQueryParams(request: Request): Record<string, string> {
  const params: Record<string, string> = {};
  const url = new URL(request.url);

  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}
