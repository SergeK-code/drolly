"use client";

import type { PublicOrder } from "@/features/orders/api";
import {
  ORDER_STATUSES,
  orderStatusName,
  type OrderStatusCode,
} from "@/lib/order-status";
import { formatMoney } from "@/features/orders/money";
import { Badge } from "@/ui/badge";
import { cx } from "@/ui/cx";

export function OrderStatusBadge({
  status,
}: {
  status: OrderStatusCode;
}) {
  const tone =
    status === "delivered"
      ? "success"
      : status === "cancelled"
        ? "danger"
        : status === "pending"
          ? "warning"
          : "accent";

  return <Badge tone={tone}>{orderStatusName(status)}</Badge>;
}

export function OrderSummary({
  order,
  onStatusSelect,
  statusPending = false,
}: {
  order: PublicOrder;
  onStatusSelect?: (status: OrderStatusCode) => void;
  statusPending?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono text-sm text-muted">{order.orderNumber}</p>
          <OrderStatusBadge status={order.status} />
        </div>
        {order.customerName ? (
          <p className="text-sm text-muted">{order.customerName}</p>
        ) : null}
      </div>
      {onStatusSelect ? (
        <OrderStatusChips
          status={order.status}
          onSelect={onStatusSelect}
          pending={statusPending}
        />
      ) : null}
      <ul className="flex flex-col gap-2 text-sm">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span>
              {item.productName} × {item.quantity}
            </span>
            <span>{formatMoney(item.lineTotalMinor, order.currency)}</span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-1 text-sm">
        <div className="flex justify-between gap-3">
          <dt>Subtotal</dt>
          <dd>{formatMoney(order.subtotalMinor, order.currency)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Delivery</dt>
          <dd>{formatMoney(order.deliveryFeeMinor, order.currency)}</dd>
        </div>
        <div className="flex justify-between gap-3 font-medium">
          <dt>Total</dt>
          <dd>{formatMoney(order.totalMinor, order.currency)}</dd>
        </div>
      </dl>
      <p className="text-sm text-muted">
        {order.recipientName}, {order.phone}
        <br />
        {order.deliveryAddress}
        {order.deliveryNotes ? (
          <>
            <br />
            {order.deliveryNotes}
          </>
        ) : null}
      </p>
      <p className="text-sm text-muted">Pay cash on delivery.</p>
    </div>
  );
}

function OrderStatusChips({
  status,
  onSelect,
  pending,
}: {
  status: OrderStatusCode;
  onSelect: (status: OrderStatusCode) => void;
  pending: boolean;
}) {
  return (
    <ol className="flex flex-wrap gap-2" aria-label="Order status">
      {ORDER_STATUSES.map((item) => {
        const current = item.code === status;
        return (
          <li key={item.code}>
            <button
              type="button"
              className={cx(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                current
                  ? item.code === "cancelled"
                    ? "bg-danger-bg text-danger"
                    : item.code === "delivered"
                      ? "bg-success-bg text-success"
                      : "bg-accent-subtle text-accent"
                  : "bg-muted-bg text-muted",
                !current &&
                  "cursor-pointer hover:bg-accent-subtle hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              )}
              disabled={pending || current}
              aria-current={current ? "true" : undefined}
              aria-pressed={current}
              onClick={() => onSelect(item.code)}
            >
              {item.name}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
