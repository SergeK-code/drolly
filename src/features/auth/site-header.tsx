"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { LayoutDashboard, ShoppingCart, Store, User } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { AuthActions } from "@/features/auth/auth-actions";
import { headerLinks } from "@/features/auth/header-links";
import { usePublicStoreSettingsQuery } from "@/features/store/hooks";
import { cartItemCount } from "@/features/cart/cart-state";
import { useCart } from "@/features/cart/cart-store";
import { Badge } from "@/ui/badge";
import { Icon } from "@/ui/icon";
import { NavLink } from "@/ui/nav-link";
import { cx } from "@/ui/cx";

export function SiteHeader() {
  const { user, status } = useAuth();
  const settingsQuery = usePublicStoreSettingsQuery();
  const storeName = settingsQuery.data?.settings.storeName ?? "Drolly";
  const links = headerLinks(status === "authenticated" ? user : null);

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className={cx(
            "inline-flex min-h-11 items-center text-sm font-semibold tracking-tight text-foreground",
            "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
        >
          {storeName}
        </Link>
        <nav
          aria-label="Site"
          className="hidden items-center gap-1 md:flex"
        >
          {links.map((link) =>
            link.href === "/cart" ? (
              <CartHeaderLink
                key={link.href}
                href={link.href}
                label={link.label}
              />
            ) : (
              <NavLink
                key={link.href}
                href={link.href}
                match={link.match}
                tone="header"
              >
                {link.href === "/" ? <Icon icon={Store} /> : null}
                {link.href === "/account" ? <Icon icon={User} /> : null}
                {link.href === "/admin" ? (
                  <Icon icon={LayoutDashboard} />
                ) : null}
                {link.label}
              </NavLink>
            ),
          )}
          <AuthActions variant="header" />
        </nav>
        <div className="flex items-center md:hidden">
          <AuthActions variant="compact" />
        </div>
      </div>
    </header>
  );
}

function CartHeaderLink({ href, label }: { href: string; label: string }) {
  const items = useCart((state) => state.items);
  const hydrated = useSyncExternalStore(
    subscribeCartHydration,
    () => useCart.persist.hasHydrated(),
    () => false,
  );
  const count = hydrated ? cartItemCount(items) : 0;

  return (
    <NavLink href={href} match="exact" tone="header">
      <Icon icon={ShoppingCart} />
      {label}
      {count > 0 ? (
        <Badge tone="accent" className="min-w-5 justify-center px-1.5">
          {count}
        </Badge>
      ) : null}
    </NavLink>
  );
}

function subscribeCartHydration(onChange: () => void): () => void {
  return useCart.persist.onFinishHydration(onChange);
}
