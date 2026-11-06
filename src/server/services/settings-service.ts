import "server-only";

import type { PublicUser } from "@/server/auth/public-user";
import { requireAdmin } from "@/server/auth/protect";
import { validationFailed } from "@/server/http/api";
import type { StoreSettingsWrite } from "@/lib/store-settings-schema";
import {
  getDashboardSummary,
  getStoreSettings,
  updateStoreSettings,
} from "@/server/repositories/settings-repository";

export function rejectSettingsPrivilegedFields(body: unknown): void {
  if (!body || typeof body !== "object") {
    return;
  }

  if ("id" in body || "role" in body || "role_id" in body) {
    throw validationFailed({
      id: ["This field cannot be set from the client."],
    });
  }
}

export async function readPublicStoreSettings() {
  return getStoreSettings();
}

export async function readAdminStoreSettings(user: PublicUser | null) {
  requireAdmin(user);
  return getStoreSettings();
}

export async function writeAdminStoreSettings(
  user: PublicUser | null,
  input: StoreSettingsWrite,
) {
  requireAdmin(user);
  return updateStoreSettings(input);
}

export async function readAdminDashboard(user: PublicUser | null) {
  requireAdmin(user);
  return getDashboardSummary();
}
