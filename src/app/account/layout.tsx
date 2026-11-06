import { type ReactNode } from "react";
import { ProtectedPage } from "@/server/auth/protect";
import { PageShell } from "@/ui/page-shell";
import { TextLink } from "@/ui/text-link";

export const instant = false;

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PageShell>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your account</h1>
      <nav aria-label="Account" className="flex flex-wrap gap-4 text-sm">
        <TextLink href="/account">Profile</TextLink>
        <TextLink href="/account/addresses">Addresses</TextLink>
        <TextLink href="/account/orders">Orders</TextLink>
      </nav>
      <ProtectedPage returnTo="/account">{children}</ProtectedPage>
    </PageShell>
  );
}
