"use client";

import { usePathname } from "next/navigation";
import { Suspense, useSyncExternalStore } from "react";
import { ShoppingCart, Store, User } from "lucide-react";
import { useAuth } from "@/features/auth/hooks";
import { cartItemCount } from "@/features/cart/cart-state";
import { useCart } from "@/features/cart/cart-store";
import { Badge } from "@/ui/badge";
import { ButtonLink } from "@/ui/button";
import { Icon } from "@/ui/icon";
import { NavLink } from "@/ui/nav-link";

export function StorefrontChrome() {
  return (
    <Suspense fallback={<ChromeFallback />}>
      <StorefrontChromeInner />
    </Suspense>
  );
}

function StorefrontChromeInner() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <CartDock />
      <MobileTabBar />
    </>
  );
}

function ChromeFallback() {
  return (
    <nav
      aria-hidden
      className="fixed inset-x-0 bottom-0 z-40 h-[calc(2.75rem+max(0.5rem,env(safe-area-inset-bottom)))] border-t border-border bg-surface md:hidden"
    />
  );
}

function MobileTabBar() {
  const { status } = useAuth();
  const accountHref =
    status === "authenticated" ? "/account" : "/sign-in";
  const items = useCart((state) => state.items);
  const hydrated = useSyncExternalStore(
    subscribeCartHydration,
    () => useCart.persist.hasHydrated(),
    () => false,
  );
  const count = hydrated ? cartItemCount(items) : 0;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="flex items-stretch">
        <NavLink href="/" match="exact" tone="tab">
          <Icon icon={Store} className="size-5" />
          Catalog
        </NavLink>
        <NavLink href="/cart" match="exact" tone="tab">
          <span className="relative">
            <Icon icon={ShoppingCart} className="size-5" />
            {count > 0 ? (
              <Badge
                tone="accent"
                className="absolute -right-3 -top-2 min-w-5 justify-center px-1"
              >
                {count}
              </Badge>
            ) : null}
          </span>
          Cart
        </NavLink>
        <NavLink href={accountHref} match="prefix" tone="tab">
          <Icon icon={User} className="size-5" />
          Account
        </NavLink>
      </div>
    </nav>
  );
}

function CartDock() {
  const pathname = usePathname();
  const items = useCart((state) => state.items);
  const hydrated = useSyncExternalStore(
    subscribeCartHydration,
    () => useCart.persist.hasHydrated(),
    () => false,
  );
  const count = hydrated ? cartItemCount(items) : 0;
  const hide =
    count === 0 ||
    pathname === "/cart" ||
    pathname.startsWith("/checkout");

  if (hide) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 px-4 md:hidden">
      <div className="pointer-events-auto mx-auto flex max-w-6xl justify-end pb-2">
        <ButtonLink href="/cart" className="shadow-md">
          <Icon icon={ShoppingCart} />
          Cart · {count}
        </ButtonLink>
      </div>
    </div>
  );
}

function subscribeCartHydration(onChange: () => void): () => void {
  return useCart.persist.onFinishHydration(onChange);
}
