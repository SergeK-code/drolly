import "server-only";

import { requireAdmin, requireAuthenticatedUser } from "@/server/auth/guards";
import { toPublicUser, type PublicUser } from "@/server/auth/public-user";
import { getProfileByUserId } from "@/server/repositories/profile-repository";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export async function getCurrentUser(): Promise<PublicUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const profile = await getProfileByUserId(data.user.id);
  const email = data.user.email ?? "";

  return toPublicUser({
    id: data.user.id,
    email,
    fullName: profile?.fullName ?? "",
    role: profile?.role ?? "customer",
  });
}

export async function requireAuthenticatedUserFromSession(): Promise<PublicUser> {
  return requireAuthenticatedUser(await getCurrentUser());
}

export async function requireAdminFromSession(): Promise<PublicUser> {
  return requireAdmin(await getCurrentUser());
}
