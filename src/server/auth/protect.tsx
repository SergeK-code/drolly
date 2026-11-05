import "server-only";

import { Suspense, type ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { resolvePostAuthPath, signInHref, withNotice } from "@/lib/return-to";
import { AppError } from "@/server/http/api";
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

  return toPublicUser({
    id: data.user.id,
    email: data.user.email ?? "",
    fullName: profile?.fullName ?? "",
    role: profile?.role ?? "customer",
  });
}

export async function requireAdminFromSession(): Promise<PublicUser> {
  return requireAdmin(await getCurrentUser());
}

export function requireAuthenticatedUser(user: PublicUser | null): PublicUser {
  if (!user) {
    throw new AppError("UNAUTHENTICATED", 401, "You need to sign in.");
  }

  return user;
}

export function requireAdmin(user: PublicUser | null): PublicUser {
  const current = requireAuthenticatedUser(user);

  if (current.role !== "admin") {
    throw new AppError(
      "FORBIDDEN",
      403,
      "You do not have permission to do that.",
    );
  }

  return current;
}

export async function redirectIfAuthenticated(returnTo: unknown): Promise<void> {
  await cookies();
  const user = await getCurrentUser();

  if (user) {
    redirect(resolvePostAuthPath(returnTo, user.role));
  }
}

export function ProtectedPage({
  children,
  returnTo,
  requireAdmin = false,
  fallback = <p className="text-sm text-muted">Checking session…</p>,
}: {
  children: ReactNode;
  returnTo: string;
  requireAdmin?: boolean;
  fallback?: ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      <Gate returnTo={returnTo} requireAdmin={requireAdmin}>
        {children}
      </Gate>
    </Suspense>
  );
}

async function Gate({
  children,
  returnTo,
  requireAdmin,
}: {
  children: ReactNode;
  returnTo: string;
  requireAdmin: boolean;
}) {
  await connection();
  await cookies();
  const user = await getCurrentUser();

  if (!user) {
    redirect(withNotice(signInHref(returnTo), "signin-required"));
  }

  if (requireAdmin && user.role !== "admin") {
    redirect(withNotice("/account", "admin-only"));
  }

  return children;
}
