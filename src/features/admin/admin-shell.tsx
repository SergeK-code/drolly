"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { adminNavItems } from "@/features/admin/admin-nav";
import { Button } from "@/ui/button";
import { cx } from "@/ui/cx";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-foreground/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={cx(
          "z-40 flex w-64 shrink-0 flex-col border-r border-border bg-surface",
          "fixed inset-y-0 left-0 overflow-hidden shadow-md transition-transform lg:static lg:h-full lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="shrink-0 border-b border-border px-4 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Dashboard
          </p>
          <p className="mt-1 text-base font-semibold">Store admin</p>
        </div>
        <nav
          aria-label="Admin"
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-3"
        >
          {adminNavItems.map((item) => {
            const selected =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "rounded-md px-3 py-2.5 text-sm font-medium",
                  selected
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-background",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpen(true)}
            aria-label="Open admin menu"
          >
            Menu
          </Button>
          <p className="text-sm font-medium">Admin</p>
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
