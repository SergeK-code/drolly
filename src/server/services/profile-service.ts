import "server-only";

import type { PublicUser } from "@/server/auth/public-user";
import { requireAuthenticatedUser } from "@/server/auth/protect";
import { notFound, validationFailed } from "@/server/http/api";
import type { ProfileWriteInput } from "@/lib/profile-schema";
import {
  getProfileByUserId,
  updateOwnProfile,
} from "@/server/repositories/profile-repository";

export function rejectProfilePrivilegedFields(body: unknown): void {
  if (!body || typeof body !== "object") {
    return;
  }

  if ("role" in body || "role_id" in body || "id" in body) {
    throw validationFailed({
      role: ["Role and account id cannot be set from the client."],
    });
  }
}

export async function getOwnProfile(user: PublicUser | null) {
  const current = requireAuthenticatedUser(user);
  const profile = await getProfileByUserId(current.id);

  if (!profile) {
    throw notFound("Profile not found.");
  }

  return {
    email: current.email,
    fullName: profile.fullName,
    phone: profile.phone,
    role: profile.role,
  };
}

export async function updateOwnProfileFields(
  user: PublicUser | null,
  input: ProfileWriteInput,
) {
  const current = requireAuthenticatedUser(user);
  const profile = await updateOwnProfile(current.id, {
    fullName: input.fullName,
    phone: input.phone ?? null,
  });

  return {
    email: current.email,
    fullName: profile.fullName,
    phone: profile.phone,
    role: current.role,
  };
}
