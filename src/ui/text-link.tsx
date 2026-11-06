"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cx } from "@/lib/ui/cx";
import { Icon } from "@/ui/icon";

export function TextLink({
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cx(
        "text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
      {...props}
    />
  );
}

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <TextLink
      href={href}
      className="inline-flex min-h-11 w-fit items-center gap-1 text-sm no-underline hover:underline"
    >
      <Icon icon={ChevronLeft} />
      {children}
    </TextLink>
  );
}
