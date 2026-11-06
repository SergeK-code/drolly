import type { ReactNode } from "react";
import { cx } from "@/ui/cx";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex flex-col items-start gap-2 rounded-lg bg-surface px-5 py-10 ring-1 ring-border",
        className,
      )}
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="max-w-md text-sm leading-6 text-muted">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
