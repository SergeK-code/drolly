import {
  forbiddenError,
  unauthenticatedError,
} from "@/server/auth/auth-errors";
import type { PublicUser } from "@/server/auth/public-user";

export function requireAuthenticatedUser(user: PublicUser | null): PublicUser {
  if (!user) {
    throw unauthenticatedError();
  }

  return user;
}

export function requireAdmin(user: PublicUser | null): PublicUser {
  const current = requireAuthenticatedUser(user);

  if (current.role !== "admin") {
    throw forbiddenError();
  }

  return current;
}
