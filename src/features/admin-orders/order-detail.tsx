"use client";

import { useState } from "react";
import { OrderSummary } from "@/features/orders/order-summary";
import {
  useAdminOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/features/orders/hooks";
import { formatMoney } from "@/features/orders/money";
import { ApiError, explainApiError } from "@/lib/api";
import {
  adminOrderStatusBodySchema,
  ORDER_STATUS_TRANSITIONS,
  type OrderStatusCode,
} from "@/lib/order-status";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { AdminPanel } from "@/features/admin/admin-panel";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { ConfirmModal } from "@/ui/confirm-modal";
import { QueryState } from "@/ui/error-retry";
import { Field } from "@/ui/field";
import { Select } from "@/ui/input";
import { useToast } from "@/ui/toast";

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const query = useAdminOrderQuery(orderId);
  const mutation = useUpdateOrderStatusMutation(orderId);
  const { showToast } = useToast();
  const [nextStatus, setNextStatus] = useState<OrderStatusCode | "">("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const notFound =
    query.isError &&
    query.error instanceof ApiError &&
    query.error.code === "NOT_FOUND";

  if (notFound) {
    return <p className="text-sm text-muted">This order was not found.</p>;
  }

  const order = query.data?.order;
  const allowed = order ? ORDER_STATUS_TRANSITIONS[order.status] : [];

  function requestStatusUpdate() {
    const parsed = validateForm(adminOrderStatusBodySchema, {
      status: nextStatus,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    setFieldErrors({});
    setConfirmOpen(true);
  }

  async function onConfirm() {
    const parsed = validateForm(adminOrderStatusBodySchema, {
      status: nextStatus,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      setConfirmOpen(false);
      return;
    }

    try {
      await mutation.mutateAsync(parsed.data.status);
      showToast("success", "Order status updated.");
      setConfirmOpen(false);
      setNextStatus("");
    } catch (error) {
      const explained = explainApiError(error);
      setFieldErrors(explained.fieldErrors);
      showToast("error", explained.message);
    }
  }

  return (
    <AdminPanel
      title={order ? order.orderNumber : "Order"}
      description="Status changes follow the allowed transition map. Totals cannot be edited."
    >
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading order…"
        errorMessage="Could not load this order."
        onRetry={() => void query.refetch()}
      >
        {order ? (
          <div className="flex flex-col gap-4">
            <Card>
              <OrderSummary order={order} />
              <p className="mt-3 text-sm text-muted">
                {formatMoney(order.totalMinor, order.currency)} due on delivery.
              </p>
            </Card>
            {allowed.length > 0 ? (
              <div className="flex flex-wrap items-end gap-3">
                <Field
                  id="next-status"
                  label="Next status"
                  error={firstFieldError(fieldErrors, "status")}
                >
                  <Select
                    id="next-status"
                    value={nextStatus}
                    onChange={(event) => {
                      setNextStatus(event.target.value as OrderStatusCode);
                      setFieldErrors({});
                    }}
                  >
                    <option value="">Select status</option>
                    {allowed.map((code) => (
                      <option key={code} value={code}>
                        {code.replaceAll("_", " ")}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Button
                  disabled={mutation.isPending}
                  onClick={requestStatusUpdate}
                >
                  Update status
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted">No further status changes.</p>
            )}
          </div>
        ) : null}
      </QueryState>
      <ConfirmModal
        open={confirmOpen}
        title="Update order status"
        message={
          nextStatus
            ? `Change this order to ${nextStatus.replaceAll("_", " ")}?`
            : "Choose a status."
        }
        confirmLabel="Update"
        pending={mutation.isPending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void onConfirm()}
      />
    </AdminPanel>
  );
}
