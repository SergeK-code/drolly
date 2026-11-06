"use client";

import { useAdminDashboardQuery } from "@/features/store/hooks";
import { AdminPanel } from "@/ui/admin/admin-panel";
import { Card } from "@/ui/card";
import { QueryState } from "@/ui/error-retry";
import { TextLink } from "@/ui/text-link";

export function AdminDashboard() {
  const query = useAdminDashboardQuery();
  const dashboard = query.data?.dashboard;

  return (
    <AdminPanel
      title="Dashboard"
      description="Counts from current catalog and order rows. No extra analytics."
    >
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading summary…"
        errorMessage="Could not load the dashboard."
        onRetry={() => void query.refetch()}
      >
        {dashboard ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryCard label="Categories" value={dashboard.categoryCount} href="/admin/categories" />
            <SummaryCard label="Products" value={dashboard.productCount} href="/admin/products" />
            <SummaryCard label="Orders" value={dashboard.orderCount} href="/admin/orders" />
            <SummaryCard
              label="Pending orders"
              value={dashboard.pendingOrderCount}
              href="/admin/orders"
            />
          </div>
        ) : null}
      </QueryState>
    </AdminPanel>
  );
}

function SummaryCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <TextLink href={href} className="mt-3 inline-block text-sm">
        Open
      </TextLink>
    </Card>
  );
}
