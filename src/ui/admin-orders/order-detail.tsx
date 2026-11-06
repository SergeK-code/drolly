"use client";

import { useState } from "react";
import { OrderSummary } from "@/ui/orders/order-summary";
import {
  useAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/features/admin-orders/hooks";
import { formatMoney } from "@/lib/ui/money";
import { ApiError, explainApiError } from "@/lib/ui/api";
import { orderStatusName, type OrderStatusCode } from "@/lib/order-status";
import { AdminPanel } from "@/ui/admin/admin-panel";
import { Card } from "@/ui/card";
import { ConfirmModal } from "@/ui/confirm-modal";
import { QueryState } from "@/ui/error-retry";
import { useToast } from "@/ui/toast";

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const query = useAdminOrderQuery(orderId);
  const mutation = useUpdateOrderStatusMutation(orderId);
  const { showToast } = useToast();
  const [nextStatus, setNextStatus] = useState<OrderStatusCode | "">("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const notFound =
    query.isError &&
    query.error instanceof ApiError &&
    query.error.code === "NOT_FOUND";

  if (notFound) {
    return <p className="text-sm text-muted">This order was not found.</p>;
  }

  const order = query.data?.order;

  function requestStatusUpdate(status: OrderStatusCode) {
    if (!order || status === order.status) {
      return;
    }

    setNextStatus(status);
    setConfirmOpen(true);
  }

  async function onConfirm() {
    if (!nextStatus) {
      setConfirmOpen(false);
      return;
    }

    try {
      await mutation.mutateAsync(nextStatus);
      showToast("success", "Order status updated.");
      setConfirmOpen(false);
      setNextStatus("");
    } catch (error) {
      const explained = explainApiError(error);
      showToast("error", explained.message);
    }
  }

  return (
    <AdminPanel
      title={order ? order.orderNumber : "Order"}
      description="Click a status chip to update this order. Totals cannot be edited."
    >
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading order…"
        errorMessage="Could not load this order."
        onRetry={() => void query.refetch()}
      >
        {order ? (
          <Card>
            <OrderSummary
              order={order}
              onStatusSelect={requestStatusUpdate}
              statusPending={mutation.isPending}
            />
            <p className="mt-3 text-sm text-muted">
              {formatMoney(order.totalMinor, order.currency)} due on delivery.
            </p>
          </Card>
        ) : null}
      </QueryState>
      <ConfirmModal
        open={confirmOpen}
        title="Update order status"
        message={
          nextStatus
            ? `Change this order to ${orderStatusName(nextStatus)}?`
            : "Choose a status."
        }
        confirmLabel="Update"
        pending={mutation.isPending}
        onClose={() => {
          setConfirmOpen(false);
          setNextStatus("");
        }}
        onConfirm={() => void onConfirm()}
      />
    </AdminPanel>
  );
}
