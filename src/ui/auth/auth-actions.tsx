"use client";

import { NavLink } from "@/ui/nav-link";
import { Skeleton } from "@/ui/skeleton";
import { Icon } from "@/ui/icon";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { SignOutButton } from "@/ui/auth/sign-out-button";
import { cx } from "@/lib/ui/cx";

export function AuthActions({
  variant,
}: {
  variant: "header" | "footer" | "compact";
}) {
  const { status } = useAuth();
  const tone = variant === "footer" ? "footer" : "header";

  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-2" aria-busy="true">
        <span className="sr-only">Checking account</span>
        <Skeleton className="h-11 w-20" />
        {variant === "compact" ? null : <Skeleton className="h-11 w-24" />}
      </span>
    );
  }

  if (status === "authenticated") {
    return (
      <span className={cx("inline-flex items-center", variant === "footer" ? "gap-4" : "gap-1")}>
        <SignOutButton variant="nav" />
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <NavLink href="/sign-in" match="exact" tone="header">
        <Icon icon={LogIn} />
        Sign in
      </NavLink>
    );
  }

  return (
    <span
      className={cx(
        "inline-flex items-center",
        variant === "footer" ? "gap-4" : "gap-1",
      )}
    >
      <NavLink href="/sign-in" match="exact" tone={tone}>
        {variant === "header" ? <Icon icon={LogIn} /> : null}
        Sign in
      </NavLink>
      <NavLink href="/sign-up" match="exact" tone={tone}>
        {variant === "header" ? <Icon icon={UserPlus} /> : null}
        Create account
      </NavLink>
    </span>
  );
}
