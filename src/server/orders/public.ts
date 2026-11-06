import type { OrderStatusCode } from "@/server/orders/schemas";

export type PublicAddress = {
  id: string;
  label: string | null;
  recipientName: string;
  phone: string;
  addressLine: string;
  area: string;
  notes: string | null;
  isDefault: boolean;
};

export type PublicOrderItem = {
  id: string;
  productId: string | null;
  productName: string;
  sku: string | null;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
};

export type PublicOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatusCode;
  statusName: string;
  recipientName: string;
  phone: string;
  deliveryAddress: string;
  deliveryNotes: string | null;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  currency: string;
  paymentMethod: "cash_on_delivery";
  createdAt: string;
  customerName?: string;
  items: PublicOrderItem[];
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status_id: number;
  recipient_name: string;
  phone: string;
  delivery_address: string;
  delivery_notes: string | null;
  subtotal_minor: number;
  delivery_fee_minor: number;
  total_minor: number;
  currency: string;
  payment_method: string;
  created_at: string;
  order_statuses:
    | { code: string; name: string }
    | { code: string; name: string }[]
    | null;
  profiles?:
    | { full_name: string }
    | { full_name: string }[]
    | null;
  order_items?:
    | {
        id: string;
        product_id: string | null;
        product_name: string;
        sku: string | null;
        unit_price_minor: number;
        quantity: number;
        line_total_minor: number;
      }[]
    | null;
};

export function toPublicAddress(row: {
  id: string;
  label: string | null;
  recipient_name: string;
  phone: string;
  address_line: string;
  area: string;
  notes: string | null;
  is_default: boolean;
}): PublicAddress {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    addressLine: row.address_line,
    area: row.area,
    notes: row.notes,
    isDefault: row.is_default,
  };
}

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function toPublicOrder(
  row: OrderRow,
  options?: { includeCustomer?: boolean },
): PublicOrder {
  const status = one(row.order_statuses);
  const profile = one(row.profiles);
  const items = row.order_items ?? [];

  return {
    id: row.id,
    orderNumber: row.order_number,
    status: (status?.code ?? "pending") as PublicOrder["status"],
    statusName: status?.name ?? "Pending",
    recipientName: row.recipient_name,
    phone: row.phone,
    deliveryAddress: row.delivery_address,
    deliveryNotes: row.delivery_notes,
    subtotalMinor: row.subtotal_minor,
    deliveryFeeMinor: row.delivery_fee_minor,
    totalMinor: row.total_minor,
    currency: row.currency,
    paymentMethod: "cash_on_delivery",
    createdAt: row.created_at,
    ...(options?.includeCustomer
      ? { customerName: profile?.full_name ?? "" }
      : {}),
    items: items.map((item) => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      sku: item.sku,
      unitPriceMinor: item.unit_price_minor,
      quantity: item.quantity,
      lineTotalMinor: item.line_total_minor,
    })),
  };
}
