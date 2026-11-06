import "server-only";

import {
  conflict,
  forbidden,
  notFound,
  serviceUnavailable,
  unauthenticated,
  validationFailed,
} from "@/server/http/api";
import { logger } from "@/server/logging/logger";
import {
  decodeOrderCursor,
  encodeCursor,
  pageOffset,
  splitPage,
  type OrderCursor,
} from "@/server/catalog/pagination";
import {
  toPublicOrder,
  type OrderRow,
  type PublicOrder,
} from "@/server/orders/public";
import type {
  CheckoutBody,
  OrderListQuery,
  OrderStatusCode,
} from "@/server/orders/schemas";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const ORDER_SELECT =
  "id, order_number, user_id, status_id, recipient_name, phone, delivery_address, delivery_notes, subtotal_minor, delivery_fee_minor, total_minor, currency, payment_method, created_at, order_statuses(code, name), profiles(full_name)";

const ORDER_DETAIL_SELECT = `${ORDER_SELECT}, order_items(id, product_id, product_name, sku, unit_price_minor, quantity, line_total_minor)`;

export async function placeCodOrder(input: CheckoutBody): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("place_cod_order", {
    p_idempotency_key: input.idempotencyKey,
    p_items: input.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_address_id: input.addressId ?? null,
    p_address: input.address
      ? {
          recipient_name: input.address.recipientName,
          phone: input.address.phone,
          address_line: input.address.addressLine,
          area: input.address.area,
          notes: input.address.notes ?? null,
        }
      : null,
  });

  if (error) {
    throw mapCheckoutError(error);
  }

  if (typeof data !== "string" || data.length === 0) {
    throw serviceUnavailable();
  }

  return data;
}

export async function getOrderById(
  id: string,
  options?: { includeCustomer?: boolean },
): Promise<PublicOrder> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logger.warn({ code: error.code }, "Order lookup failed");
    throw serviceUnavailable();
  }

  if (!data) {
    throw notFound("Order not found.");
  }

  return toPublicOrder(data as OrderRow, {
    includeCustomer: options?.includeCustomer,
  });
}

export async function listOrders(
  query: OrderListQuery,
  options?: { userId?: string; includeCustomer?: boolean },
): Promise<{
  items: PublicOrder[];
  hasMore: boolean;
  nextCursor: string | null;
  page: number | null;
}> {
  const supabase = await createSupabaseServerClient();
  const cursor = query.cursor ? decodeOrderCursor(query.cursor) : undefined;
  const offset = query.page ? pageOffset(query.page, query.limit) : undefined;

  let builder = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (options?.userId) {
    builder = builder.eq("user_id", options.userId);
  }

  if (query.status) {
    const statusId = await statusIdForCode(query.status);
    builder = builder.eq("status_id", statusId);
  }

  if (cursor) {
    builder = builder.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  if (offset !== undefined) {
    builder = builder.range(offset, offset + query.limit);
  } else {
    builder = builder.limit(query.limit + 1);
  }

  const { data, error } = await builder;

  if (error) {
    logger.warn({ code: error.code }, "Order list failed");
    throw serviceUnavailable();
  }

  const { items, hasMore } = splitPage((data ?? []) as OrderRow[], query.limit);
  const last = items.at(-1);

  return {
    items: items.map((row) =>
      toPublicOrder(row, { includeCustomer: options?.includeCustomer }),
    ),
    hasMore,
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.created_at, id: last.id } satisfies OrderCursor)
        : null,
    page: query.page ?? null,
  };
}

export async function updateOrderStatusRow(input: {
  orderId: string;
  fromStatus: OrderStatusCode;
  toStatus: OrderStatusCode;
}): Promise<PublicOrder> {
  const supabase = await createSupabaseServerClient();
  const fromId = await statusIdForCode(input.fromStatus);
  const toId = await statusIdForCode(input.toStatus);

  const { data, error } = await supabase
    .from("orders")
    .update({ status_id: toId })
    .eq("id", input.orderId)
    .eq("status_id", fromId)
    .select(ORDER_DETAIL_SELECT)
    .maybeSingle();

  if (error) {
    logger.warn({ code: error.code }, "Order status update failed");
    throw serviceUnavailable();
  }

  if (!data) {
    throw conflict("The order status could not be updated.");
  }

  return toPublicOrder(data as OrderRow, { includeCustomer: true });
}

async function statusIdForCode(code: OrderStatusCode): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("order_statuses")
    .select("id")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    throw serviceUnavailable();
  }

  return data.id;
}

function mapCheckoutError(error: { message?: string; code?: string }): never {
  const code = error.message?.match(/CHECKOUT_[A-Z]+/)?.[0];

  switch (code) {
    case "CHECKOUT_UNAUTHENTICATED":
      throw unauthenticated();
    case "CHECKOUT_FORBIDDEN":
      throw forbidden("Checkout is available to customer accounts.");
    case "CHECKOUT_EMPTY":
      throw validationFailed({ items: ["Add at least one product."] });
    case "CHECKOUT_VALIDATION":
      throw validationFailed({ items: ["The cart items are invalid."] });
    case "CHECKOUT_ADDRESS":
      throw validationFailed({
        recipientName: ["Enter the recipient name."],
        phone: ["Enter a phone number."],
        addressLine: ["Enter the street address."],
        area: ["Enter the area."],
      });
    case "CHECKOUT_UNAVAILABLE":
      throw conflict("A product in the cart is no longer available.");
    case "CHECKOUT_STOCK":
      throw conflict("There is not enough stock for this order.");
    case "CHECKOUT_MINIMUM":
      throw validationFailed({
        items: ["The order is below the store minimum."],
      });
    case "CHECKOUT_CURRENCY":
      throw conflict("The cart mixes currencies that cannot be checked out.");
    default:
      logger.warn(
        { code: error.code },
        "Checkout function failed",
      );
      throw serviceUnavailable();
  }
}
