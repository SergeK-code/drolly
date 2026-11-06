"use client";

import { useState } from "react";
import { OrderSummary } from "@/ui/orders/order-summary";
import { useCancelOrderMutation, useOrderQuery } from "@/features/orders/hooks";
import { ApiError, explainApiError } from "@/lib/ui/api";
import { canCustomerCancelOrder } from "@/lib/order-status";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { ConfirmModal } from "@/ui/confirm-modal";
import { QueryState } from "@/ui/error-retry";
import { useToast } from "@/ui/toast";

export function OrderDetail({ orderId }: { orderId: string }) {
  const query = useOrderQuery(orderId);
  const mutation = useCancelOrderMutation(orderId);
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const notFound =
    query.isError &&
    query.error instanceof ApiError &&
    query.error.code === "NOT_FOUND";

  if (notFound) {
    return <p className="text-sm text-muted">This order was not found.</p>;
  }

  const order = query.data?.order;
  const canCancel = order ? canCustomerCancelOrder(order.status) : false;

  async function onConfirm() {
    try {
      await mutation.mutateAsync();
      showToast("success", "Order cancelled.");
      setConfirmOpen(false);
    } catch (error) {
      const explained = explainApiError(error);
      showToast("error", explained.message);
    }
  }

  return (
    <>
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading order…"
        errorMessage="Could not load this order."
        onRetry={() => void query.refetch()}
      >
        {order ? (
          <Card>
            <OrderSummary order={order} />
            {canCancel ? (
              <div className="mt-4">
                <Button
                  variant="danger"
                  disabled={mutation.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  Cancel order
                </Button>
              </div>
            ) : null}
          </Card>
        ) : null}
      </QueryState>
      <ConfirmModal
        open={confirmOpen}
        title="Cancel order"
        message="Cancel this order? Items will return to stock."
        confirmLabel="Cancel order"
        pending={mutation.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void onConfirm()}
      />
    </>
  );
}
