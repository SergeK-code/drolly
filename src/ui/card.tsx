import type { ReactNode } from "react";
import { cx } from "@/ui/cx";

export function Card({
  className,
  hover = false,
  children,
}: {
  className?: string;
  hover?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-lg bg-surface p-4 shadow-sm ring-1 ring-border sm:p-5",
        hover &&
          "transition-[box-shadow,transform] duration-200 ease-out motion-safe:hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}
