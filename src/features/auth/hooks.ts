"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchSession,
  sessionQueryKey,
  type PublicUser,
} from "@/features/auth/api";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthState = {
  user: PublicUser | null;
  status: AuthStatus;
};

function useSessionQuery() {
  return useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    staleTime: 60_000,
  });
}

export function useAuth(): AuthState {
  const query = useSessionQuery();

  if (query.data) {
    const user = query.data.user;
    return {
      user,
      status: user ? "authenticated" : "unauthenticated",
    };
  }

  if (query.isPending) {
    return { user: null, status: "loading" };
  }

  return { user: null, status: "unauthenticated" };
}
