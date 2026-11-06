"use client";

import Link from "next/link";
import { useOrdersQuery } from "@/features/orders/hooks";
import { formatMoney } from "@/features/orders/money";
import { Card } from "@/ui/card";
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
        <p className="text-sm text-muted">
          No orders yet. <TextLink href="/">Browse products</TextLink>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {query.data?.items.map((order) => (
            <li key={order.id}>
              <Card hover>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="flex flex-col gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="font-medium">{order.orderNumber}</span>
                  <span className="text-sm text-muted">
                    {order.statusName} ·{" "}
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
