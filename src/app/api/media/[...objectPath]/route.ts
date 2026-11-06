import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { apiHandler } from "@/server/http/api";
import { catalogObjectPathFromParts } from "@/server/uploads/image";

export const GET = apiHandler(async ({ request }) => {
  const parts = new URL(request.url).pathname
    .split("/")
    .filter(Boolean)
    .slice(2);
  const objectPath = catalogObjectPathFromParts(parts);
  const publicUrl = `${getEnv().SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/catalog/${objectPath}`;
  return NextResponse.redirect(publicUrl, 302);
});
