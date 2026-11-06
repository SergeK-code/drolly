import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const checkoutAddressSchema = z
  .object({
    recipientName: z
      .string()
      .trim()
      .min(1, "Enter the recipient name.")
      .max(80, "Recipient name is too long."),
    phone: z
      .string()
      .trim()
      .min(6, "Enter a phone number (at least 6 digits).")
      .max(30, "Phone number is too long.")
      .regex(/^[+]?[\d\s()-]+$/, "Enter a valid phone number."),
    addressLine: z
      .string()
      .trim()
      .min(1, "Enter the street address.")
      .max(160, "Address is too long."),
    area: z
      .string()
      .trim()
      .min(1, "Enter the area.")
      .max(80, "Area is too long."),
    notes: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z.string().trim().max(200, "Notes are too long.").nullable().optional(),
    ),
  })
  .strict();

export const addressWriteSchema = checkoutAddressSchema
  .extend({
    label: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z.string().trim().max(40, "Label is too long.").nullable().optional(),
    ),
    isDefault: z.boolean().optional().default(false),
  })
  .strict();

const checkoutItemSchema = z
  .object({
    productId: z.uuid("Each cart item needs a valid product id."),
    quantity: z
      .number({ error: "Enter a whole number quantity." })
      .int("Enter a whole number quantity.")
      .min(1, "Quantity must be at least 1.")
      .max(99, "Quantity cannot exceed 99."),
  })
  .strict();

export const checkoutBodySchema = z
  .object({
    idempotencyKey: z.uuid("Refresh the page and try checkout again."),
    items: z
      .array(checkoutItemSchema)
      .min(1, "Add at least one product.")
      .max(50, "Remove some products. The cart is too large."),
    addressId: z.uuid("Choose a saved address.").optional(),
    address: checkoutAddressSchema.optional(),
  })
  .strict()
  .refine((value) => Boolean(value.addressId) !== Boolean(value.address), {
    message: "Choose a saved address or enter a new one, not both.",
    path: ["addressId"],
  })
  .refine(
    (value) =>
      new Set(value.items.map((item) => item.productId)).size ===
      value.items.length,
    {
      message: "Each product can appear only once.",
      path: ["items"],
    },
  );

export type CheckoutAddressInput = z.infer<typeof checkoutAddressSchema>;
export type AddressWriteInput = z.infer<typeof addressWriteSchema>;
export type CheckoutBody = z.infer<typeof checkoutBodySchema>;
