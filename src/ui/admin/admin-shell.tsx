"use client";

import { useState, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { adminNavItems } from "@/lib/ui/admin-nav";
import { Button } from "@/ui/button";
import { Icon } from "@/ui/icon";
import { NavLink } from "@/ui/nav-link";
import { cx } from "@/lib/ui/cx";

export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      {open ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-foreground/25 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <aside
        className={cx(
          "z-40 flex h-dvh min-h-0 w-64 shrink-0 flex-col border-r border-border bg-surface",
          "fixed inset-y-0 left-0 overflow-hidden shadow-md transition-transform lg:static lg:h-full lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="shrink-0 border-b border-border px-4 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Dashboard
          </p>
          <p className="mt-1 text-base font-semibold tracking-tight">
            Store admin
          </p>
        </div>
        <nav
          aria-label="Admin"
          className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3"
        >
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              match={item.href === "/admin" ? "exact" : "prefix"}
              tone="sidebar"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
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
            <Icon icon={Menu} />
            Menu
          </Button>
          <p className="text-sm font-medium">Admin</p>
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
