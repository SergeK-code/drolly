import "server-only";

import type { AppRole } from "@/server/auth/public-user";
import { logger } from "@/server/logging/logger";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type ProfileRecord = {
  fullName: string;
  role: AppRole;
};

function asAppRole(code: string | null | undefined): AppRole {
  return code === "admin" ? "admin" : "customer";
}

export async function getProfileByUserId(
  userId: string,
): Promise<ProfileRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role_id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  const { data: role, error: roleError } = await supabase
    .from("app_roles")
    .select("code")
    .eq("id", profile.role_id)
    .maybeSingle();

  if (roleError) {
    return null;
  }

  return {
    fullName: profile.full_name,
    role: asAppRole(role?.code),
  };
}

export async function ensureCustomerProfile(
  userId: string,
  fullName: string,
): Promise<ProfileRecord> {
  const existing = await getProfileByUserId(userId);
  if (existing) {
    return existing;
  }

  const supabase = await createSupabaseServerClient();
  const { data: customerRole, error: roleError } = await supabase
    .from("app_roles")
    .select("id")
    .eq("code", "customer")
    .maybeSingle();

  if (roleError || !customerRole) {
    logger.error({ userId }, "Customer role lookup failed");
    return { fullName, role: "customer" };
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    id: userId,
    role_id: customerRole.id,
    full_name: fullName,
  });

  if (insertError) {
    const afterRace = await getProfileByUserId(userId);
    if (afterRace) {
      return afterRace;
    }
  }

  return (await getProfileByUserId(userId)) ?? { fullName, role: "customer" };
}
