import { Suspense, type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <p className="px-4 py-4 text-sm text-muted sm:px-6">
          Checking session…
        </p>
      }
    >
      {children}
    </Suspense>
  );
}
