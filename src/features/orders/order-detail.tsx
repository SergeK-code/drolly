"use client";

import { OrderSummary } from "@/features/orders/order-summary";
import { useOrderQuery } from "@/features/orders/hooks";
import { ApiError } from "@/lib/api";
import { Card } from "@/ui/card";
import { QueryState } from "@/ui/error-retry";

export function OrderDetail({ orderId }: { orderId: string }) {
  const query = useOrderQuery(orderId);
  const notFound =
    query.isError &&
    query.error instanceof ApiError &&
    query.error.code === "NOT_FOUND";

  if (notFound) {
    return <p className="text-sm text-muted">This order was not found.</p>;
  }

  return (
    <QueryState
      isPending={query.isPending}
      isError={query.isError}
      pendingMessage="Loading order…"
      errorMessage="Could not load this order."
      onRetry={() => void query.refetch()}
    >
      {query.data ? (
        <Card>
          <OrderSummary order={query.data.order} />
        </Card>
      ) : null}
    </QueryState>
  );
}
