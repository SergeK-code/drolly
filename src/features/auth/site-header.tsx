"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { useSession } from "@/features/auth/hooks";
import { headerLinks } from "@/features/auth/header-links";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { cartItemCount } from "@/features/cart/cart-state";
import { useCart } from "@/features/cart/cart-store";
import { TextLink } from "@/ui/text-link";

export function SiteHeader() {
  const sessionQuery = useSession();

  const user = sessionQuery.data?.user ?? null;
  const links = headerLinks(user);

  return (
    <HeaderBar>
      {links.map((link) =>
        link.href === "/cart" ? (
          <CartHeaderLink key={link.href} href={link.href} label={link.label} />
        ) : (
          <TextLink
            key={link.href}
            href={link.href}
            className="min-h-11 inline-flex items-center"
          >
            {link.label}
          </TextLink>
        ),
      )}
      {user ? <SignOutButton variant="nav" /> : null}
    </HeaderBar>
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
    <TextLink href={href} className="min-h-11 inline-flex items-center">
      {label}
      {count > 0 ? ` (${count})` : ""}
    </TextLink>
  );
}

function subscribeCartHydration(onChange: () => void): () => void {
  return useCart.persist.onFinishHydration(onChange);
}

function HeaderBar({ children }: { children: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-surface/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-accent focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Drolly
        </Link>
        <nav
          aria-label="Site"
          className="flex flex-wrap items-center gap-4 text-sm font-medium"
        >
          {children}
        </nav>
      </div>
    </header>
  );
}
