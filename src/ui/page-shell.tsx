import type { ReactNode } from "react";
import { cx } from "@/ui/cx";
import { PageEnter } from "@/ui/page-enter";
import { SiteFooter } from "@/ui/site-footer";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-full flex-col pbe-20 md:pb-0">
      <main
        className={cx(
          "mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10",
          className,
        )}
      >
        <PageEnter>{children}</PageEnter>
      </main>
      <SiteFooter />
    </div>
  );
}
