import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const storeSettingsWriteSchema = z
  .object({
    storeName: z
      .string()
      .trim()
      .min(1, "Enter the store name.")
      .max(80, "Store name is too long."),
    contactPhone: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z
        .string()
        .trim()
        .min(6, "Enter a phone number (at least 6 digits).")
        .max(30, "Phone number is too long.")
        .regex(/^[+]?[\d\s()-]+$/, "Enter a valid phone number.")
        .nullable(),
    ),
    contactEmail: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z.email("Enter a valid email address.").nullable(),
    ),
    currency: z
      .string()
      .trim()
      .min(1, "Enter a 3-letter currency code.")
      .transform((value) => value.toUpperCase())
      .pipe(
        z
          .string()
          .regex(/^[A-Z]{3}$/, "Enter a 3-letter currency code, for example USD."),
      ),
    deliveryFeeMinor: z.coerce
      .number({ error: "Enter the delivery fee in minor units." })
      .int("Delivery fee must be a whole number.")
      .nonnegative("Delivery fee cannot be negative."),
    minimumOrderMinor: z.coerce
      .number({ error: "Enter the minimum order in minor units." })
      .int("Minimum order must be a whole number.")
      .nonnegative("Minimum order cannot be negative."),
  })
  .strict();

export type StoreSettingsWrite = z.infer<typeof storeSettingsWriteSchema>;
