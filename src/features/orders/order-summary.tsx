import type { PublicOrder } from "@/features/orders/api";
import { formatMoney } from "@/features/orders/money";

export function OrderSummary({ order }: { order: PublicOrder }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm text-muted">{order.orderNumber}</p>
        <p className="text-lg font-semibold">{order.statusName}</p>
        {order.customerName ? (
          <p className="text-sm text-muted">{order.customerName}</p>
        ) : null}
      </div>
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
