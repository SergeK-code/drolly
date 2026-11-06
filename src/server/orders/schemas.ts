import { z } from "zod";
import { orderStatusCodeSchema } from "@/lib/order-status";
import { validationFailed } from "@/server/http/api";

export {
  addressIdSchema,
  addressWriteSchema,
  checkoutAddressSchema,
  checkoutBodySchema,
  type AddressWriteInput,
  type CheckoutBody,
} from "@/lib/checkout-schema";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export {
  ORDER_STATUS_CODES,
  adminOrderStatusBodySchema,
  orderStatusCodeSchema,
  type OrderStatusCode,
} from "@/lib/order-status";

export const orderListQuerySchema = z
  .object({
    status: z.preprocess(emptyToUndefined, orderStatusCodeSchema.optional()),
    limit: z.coerce.number().int().min(1).max(24).default(12),
    cursor: z.preprocess(
      emptyToUndefined,
      z.string().min(1).max(512).optional(),
    ),
    page: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1).max(1000).optional(),
    ),
  })
  .strict()
  .refine((value) => !(value.cursor && value.page), {
    message: "Use either cursor or page, not both.",
    path: ["cursor"],
  });

export const orderIdSchema = z.uuid("This order was not found.");

export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

const REJECTED_CHECKOUT_FIELDS = [
  "price",
  "priceMinor",
  "unitPriceMinor",
  "subtotal",
  "subtotalMinor",
  "deliveryFee",
  "deliveryFeeMinor",
  "total",
  "totalMinor",
  "stock",
  "stockQuantity",
  "userId",
  "role",
  "paymentMethod",
  "paymentStatus",
  "status",
  "statusId",
  "orderStatus",
] as const;

export function rejectCheckoutPrivilegedFields(body: unknown): void {
  if (!body || typeof body !== "object") {
    return;
  }

  const record = body as Record<string, unknown>;
  const fieldErrors: Record<string, string[]> = {};

  for (const field of REJECTED_CHECKOUT_FIELDS) {
    if (field in record) {
      fieldErrors[field] = ["This value is calculated on the server."];
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw validationFailed(fieldErrors);
  }
}
