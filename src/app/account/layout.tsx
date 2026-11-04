import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";

async function AccountGate({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return children;
}

export default function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<p className="px-6 py-16">Loading account…</p>}>
      <AccountGate>{children}</AccountGate>
    </Suspense>
  );
}
