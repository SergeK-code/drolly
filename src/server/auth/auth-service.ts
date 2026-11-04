import "server-only";

import {
  invalidCredentialsError,
  registrationFailedError,
} from "@/server/auth/auth-errors";
import { toPublicUser, type PublicUser } from "@/server/auth/public-user";
import type { RegisterInput, SignInInput } from "@/server/auth/schemas";
import { logger } from "@/server/logging/logger";
import { ensureCustomerProfile } from "@/server/repositories/profile-repository";
import {
  getCurrentUser,
  requireAdminFromSession,
} from "@/server/auth/current-user";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type AuthResult = {
  user: PublicUser | null;
  confirmationRequired: boolean;
};

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { full_name: input.fullName },
    },
  });

  if (error || !data.user) {
    logger.warn({ code: error?.code }, "Registration failed");
    throw registrationFailedError();
  }

  const profile = await ensureCustomerProfile(data.user.id, input.fullName);

  if (!data.session) {
    return { user: null, confirmationRequired: true };
  }

  return {
    confirmationRequired: false,
    user: toPublicUser({
      id: data.user.id,
      email: data.user.email ?? input.email,
      fullName: profile.fullName || input.fullName,
      role: "customer",
    }),
  };
}

export async function signInUser(input: SignInInput): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.user || !data.session) {
    throw invalidCredentialsError();
  }

  const profile = await ensureCustomerProfile(data.user.id, "");

  return {
    confirmationRequired: false,
    user: toPublicUser({
      id: data.user.id,
      email: data.user.email ?? input.email,
      fullName: profile.fullName,
      role: profile.role,
    }),
  };
}

export async function signOutUser(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.warn({ code: error.code }, "Sign-out failed");
  }
}

export async function readSession(): Promise<{ user: PublicUser | null }> {
  return { user: await getCurrentUser() };
}

export async function readAdminSession(): Promise<{ user: PublicUser }> {
  return { user: await requireAdminFromSession() };
}

