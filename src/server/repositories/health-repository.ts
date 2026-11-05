import "server-only";

import { AppError } from "@/server/http/api";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export async function assertStoreSettingsReadable(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("store_settings")
    .select("id")
    .eq("id", 1)
    .limit(1);

  if (error) {
    throw new AppError(
      "DATABASE_ERROR",
      500,
      "The service is temporarily unavailable.",
    );
  }
}
