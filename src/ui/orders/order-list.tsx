"use client";

import Link from "next/link";
import { useOrdersQuery } from "@/features/orders/hooks";
import { formatMoney } from "@/lib/ui/money";
import { OrderStatusBadge } from "@/ui/orders/order-summary";
import { Card } from "@/ui/card";
import { EmptyState } from "@/ui/empty-state";
import { QueryState } from "@/ui/error-retry";
import { TextLink } from "@/ui/text-link";

export function OrderList() {
  const query = useOrdersQuery();

  return (
    <QueryState
      isPending={query.isPending}
      isError={query.isError}
      pendingMessage="Loading orders…"
      errorMessage="Could not load orders."
      onRetry={() => void query.refetch()}
    >
      {(query.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Browse the catalog and check out with cash on delivery."
          action={<TextLink href="/">Browse products</TextLink>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data?.items.map((order) => (
            <li key={order.id}>
              <Card hover>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-col gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{order.orderNumber}</span>
                    <OrderStatusBadge status={order.status} />
                  </span>
                  <span className="text-sm text-muted">
                    {formatMoney(order.totalMinor, order.currency)}
                  </span>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </QueryState>
  );
}
