import "server-only";

import { conflict, serviceUnavailable } from "@/server/http/api";
import { logger } from "@/server/logging/logger";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const BUCKET = "catalog";

export async function uploadCatalogObject(input: {
  objectPath: string;
  bytes: Uint8Array;
  contentType: string;
}): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.storage.from(BUCKET).upload(input.objectPath, input.bytes, {
    contentType: input.contentType,
    upsert: false,
  });

  if (error?.message?.toLowerCase().includes("already exists") || error?.statusCode === "409") {
    throw conflict("That image could not be stored.");
  }

  if (error) {
    logger.warn({ code: error.name }, "Catalog image upload failed");
    throw serviceUnavailable();
  }

  return input.objectPath;
}
