import { type ReactNode } from "react";
import { ProtectedPage } from "@/server/auth/protect";
import { PageShell } from "@/ui/page-shell";

export const instant = false;

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <PageShell>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your account</h1>
      <ProtectedPage returnTo="/account">{children}</ProtectedPage>
    </PageShell>
  );
}
