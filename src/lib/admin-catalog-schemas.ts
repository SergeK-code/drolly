import { z } from "zod";

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const adminCategoryWriteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a category name.")
      .max(80, "Name is too long."),
    description: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z.string().max(500, "Description is too long.").nullable(),
    ),
    sortOrder: z.coerce
      .number({ error: "Enter a sort order." })
      .int("Sort order must be a whole number.")
      .nonnegative("Sort order cannot be negative.")
      .default(0),
  })
  .strict();

export const adminProductWriteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter a product name.")
      .max(120, "Name is too long."),
    description: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z.string().max(2000, "Description is too long.").nullable(),
    ),
    categoryId: z.uuid("Choose a category."),
    priceMinor: z.coerce
      .number({ error: "Enter a price in minor units." })
      .int("Price must be a whole number.")
      .nonnegative("Price cannot be negative."),
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
    stockQuantity: z.coerce
      .number({ error: "Enter a stock quantity." })
      .int("Stock must be a whole number.")
      .nonnegative("Stock cannot be negative."),
  })
  .strict();

export type AdminCategoryWrite = z.infer<typeof adminCategoryWriteSchema>;
export type AdminProductWrite = z.infer<typeof adminProductWriteSchema>;
