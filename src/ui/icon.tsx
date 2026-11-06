"use client";

import type { LucideIcon } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cx } from "@/lib/ui/cx";

function subscribe(): () => void {
  return () => {};
}

export function Icon({
  icon: Glyph,
  className,
  label,
}: {
  icon: LucideIcon;
  className?: string;
  label?: string;
}) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  if (!mounted) {
    return (
      <span
        className={cx("inline-block size-4 shrink-0", className)}
        aria-hidden
      />
    );
  }

  return (
    <Glyph
      aria-hidden={label ? undefined : true}
      aria-label={label}
      strokeWidth={1.75}
      className={cx("size-4 shrink-0", className)}
    />
  );
}
