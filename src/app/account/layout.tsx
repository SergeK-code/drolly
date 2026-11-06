import { type ReactNode } from "react";
import { ProtectedPage } from "@/server/auth/protect";
import { PageShell } from "@/ui/page-shell";
import { NavLink } from "@/ui/nav-link";

export const instant = false;

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PageShell>
      <h1 className="text-3xl font-semibold tracking-tight">Your account</h1>
      <nav
        aria-label="Account"
        className="flex flex-wrap gap-1 rounded-md bg-muted-bg p-1"
      >
        <NavLink href="/account" match="exact" tone="segment">
          Profile
        </NavLink>
        <NavLink href="/account/addresses" match="prefix" tone="segment">
          Addresses
        </NavLink>
        <NavLink href="/account/orders" match="prefix" tone="segment">
          Orders
        </NavLink>
      </nav>
      <ProtectedPage returnTo="/account">{children}</ProtectedPage>
    </PageShell>
  );
}
