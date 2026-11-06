import "server-only";

import { cache } from "react";
import type { AppRole } from "@/server/auth/public-user";
import { notFound, serviceUnavailable } from "@/server/http/api";
import { logger } from "@/server/logging/logger";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type ProfileRecord = {
  fullName: string;
  phone: string | null;
  role: AppRole;
};

function asAppRole(code: string | null | undefined): AppRole {
  return code === "admin" ? "admin" : "customer";
}

export const getProfileByUserId = cache(async function getProfileByUserId(
  userId: string,
): Promise<ProfileRecord | null> {
  const supabase = await createSupabaseServerClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, phone, app_roles(code)")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return {
    fullName: profile.full_name,
    phone: profile.phone,
    role: asAppRole(roleCode(profile.app_roles)),
  };
});

function roleCode(
  role: { code: string } | { code: string }[] | null,
): string | null {
  if (!role) {
    return null;
  }

  if (Array.isArray(role)) {
    return role[0]?.code ?? null;
  }

  return role.code;
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
    return { fullName, phone: null, role: "customer" };
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

  return (
    (await getProfileByUserId(userId)) ?? {
      fullName,
      phone: null,
      role: "customer",
    }
  );
}

export async function updateOwnProfile(
  userId: string,
  input: { fullName: string; phone: string | null },
): Promise<{ fullName: string; phone: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name: input.fullName,
      phone: input.phone,
    })
    .eq("id", userId)
    .select("full_name, phone")
    .maybeSingle();

  if (error) {
    logger.warn({ code: error.code }, "Profile update failed");
    throw serviceUnavailable();
  }

  if (!data) {
    throw notFound("Profile not found.");
  }

  return { fullName: data.full_name, phone: data.phone };
}
