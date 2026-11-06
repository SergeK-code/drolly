import { type ReactNode } from "react";
import { ProtectedPage } from "@/server/auth/protect";
import { AdminShell } from "@/ui/admin/admin-shell";

export const instant = false;

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedPage
      returnTo="/admin"
      requireAdmin
      fallback={<p className="px-4 py-6 text-sm text-muted">Checking session…</p>}
    >
      <AdminShell>{children}</AdminShell>
    </ProtectedPage>
  );
}
