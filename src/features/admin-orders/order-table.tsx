"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminOrdersQuery } from "@/features/orders/hooks";
import { formatMoney } from "@/features/orders/money";
import { ORDER_STATUS_CODES } from "@/lib/order-status";
import { AdminPanel, AdminTableCard } from "@/features/admin/admin-panel";
import { QueryState } from "@/ui/error-retry";
import { Select } from "@/ui/input";

export function AdminOrderTable() {
  const [status, setStatus] = useState("");
  const query = useAdminOrdersQuery(status || undefined);

  return (
    <AdminPanel
      title="Orders"
      description="Review cash-on-delivery orders and move them along the allowed statuses."
      action={
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-48"
        >
          <option value="">All statuses</option>
          {ORDER_STATUS_CODES.map((code) => (
            <option key={code} value={code}>
              {code.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
      }
    >
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading orders…"
        errorMessage="Could not load orders."
        onRetry={() => void query.refetch()}
      >
        <AdminTableCard>
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-background">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {(query.data?.items.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-muted">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                query.data?.items.map((order) => (
                  <tr key={order.id} className="border-b border-border">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{order.customerName || "—"}</td>
                    <td className="px-4 py-3">{order.statusName}</td>
                    <td className="px-4 py-3">
                      {formatMoney(order.totalMinor, order.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </AdminTableCard>
      </QueryState>
    </AdminPanel>
  );
}
