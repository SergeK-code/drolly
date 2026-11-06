"use client";

import { useAuth } from "@/features/auth/hooks";
import { AuthActions } from "@/features/auth/auth-actions";
import { headerLinks } from "@/features/auth/header-links";
import { usePublicStoreSettingsQuery } from "@/features/store/hooks";
import { NavLink } from "@/ui/nav-link";

export function SiteFooter() {
  const { user, status } = useAuth();
  const settingsQuery = usePublicStoreSettingsQuery();
  const storeName = settingsQuery.data?.settings.storeName ?? "Drolly";
  const links = headerLinks(status === "authenticated" ? user : null);

  return (
    <footer className="mt-auto border-t border-border bg-surface pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex max-w-sm flex-col gap-2">
          <p className="text-sm font-semibold tracking-tight">{storeName}</p>
          <p className="text-sm leading-6 text-muted">
            Single-store catalog. Cash on delivery at the door. Manage addresses
            and orders from your account.
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-5 gap-y-1"
        >
          {links.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              match={link.match}
              tone="footer"
            >
              {link.label}
            </NavLink>
          ))}
          <AuthActions variant="footer" />
        </nav>
      </div>
    </footer>
  );
}
