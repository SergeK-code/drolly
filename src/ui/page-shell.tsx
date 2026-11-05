import type { ReactNode } from "react";
import { cx } from "@/ui/cx";
import { PageEnter } from "@/ui/page-enter";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cx(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10",
        className,
      )}
    >
      <PageEnter>{children}</PageEnter>
    </main>
  );
}
