"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { cx } from "@/lib/ui/cx";

export type NavMatch = "exact" | "prefix";
export type NavTone = "header" | "footer" | "sidebar" | "segment" | "tab";

export function navLinkIsActive(
  pathname: string,
  href: string,
  match: NavMatch,
): boolean {
  if (href === "/" || match === "exact") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

const toneClass: Record<
  NavTone,
  { base: string; active: string; inactive: string }
> = {
  header: {
    base: "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium no-underline transition-colors",
    active: "bg-muted-bg text-foreground",
    inactive:
      "text-muted hover:bg-muted-bg hover:text-foreground hover:no-underline",
  },
  footer: {
    base: "inline-flex min-h-11 items-center text-sm no-underline transition-colors",
    active: "font-medium text-foreground",
    inactive: "text-muted hover:text-foreground hover:no-underline",
  },
  sidebar: {
    base: "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors",
    active: "bg-accent text-accent-foreground shadow-sm",
    inactive: "text-muted hover:bg-muted-bg hover:text-foreground",
  },
  segment: {
    base: "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium no-underline transition-colors",
    active: "bg-surface text-foreground shadow-sm",
    inactive:
      "text-muted hover:bg-surface/80 hover:text-foreground hover:no-underline",
  },
  tab: {
    base: "flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 px-2 text-[11px] font-medium no-underline transition-colors",
    active: "text-accent",
    inactive: "text-muted hover:text-foreground hover:no-underline",
  },
};

export function NavLink({
  href,
  match = "prefix",
  tone = "header",
  className,
  children,
  onClick,
}: {
  href: string;
  match?: NavMatch;
  tone?: NavTone;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <NavLinkView
          href={href}
          tone={tone}
          className={className}
          onClick={onClick}
          active={false}
        >
          {children}
        </NavLinkView>
      }
    >
      <NavLinkWithPath
        href={href}
        match={match}
        tone={tone}
        className={className}
        onClick={onClick}
      >
        {children}
      </NavLinkWithPath>
    </Suspense>
  );
}

function NavLinkWithPath({
  href,
  match = "prefix",
  tone = "header",
  className,
  children,
  onClick,
}: {
  href: string;
  match?: NavMatch;
  tone?: NavTone;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = navLinkIsActive(pathname, href, match);

  return (
    <NavLinkView
      href={href}
      tone={tone}
      className={className}
      onClick={onClick}
      active={active}
    >
      {children}
    </NavLinkView>
  );
}

function NavLinkView({
  href,
  tone,
  className,
  children,
  onClick,
  active,
}: {
  href: string;
  tone: NavTone;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  active: boolean;
}) {
  const styles = toneClass[tone];

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cx(
        styles.base,
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        active ? styles.active : styles.inactive,
        className,
      )}
    >
      {children}
    </Link>
  );
}
