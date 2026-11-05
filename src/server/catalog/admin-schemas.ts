import { z } from "zod";
import { AppError } from "@/server/http/api";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const emptyToNull = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const adminIdSchema = z.uuid();

export const adminCategoryWriteSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    description: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z.string().max(500).nullable(),
    ),
    sortOrder: z.coerce.number().int().nonnegative().default(0),
  })
  .strict();

export const adminProductWriteSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    description: z.preprocess(
      (value) => (value === undefined ? null : emptyToNull(value)),
      z.string().max(2000).nullable(),
    ),
    categoryId: z.uuid(),
    priceMinor: z.coerce.number().int().nonnegative(),
    currency: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(z.string().regex(/^[A-Z]{3}$/, "Enter a 3-letter currency code.")),
    stockQuantity: z.coerce.number().int().nonnegative(),
  })
  .strict();

export const adminActiveSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();

export const adminListQuerySchema = z
  .object({
    q: z.preprocess(emptyToUndefined, z.string().max(80).optional()),
    categoryId: z.preprocess(emptyToUndefined, z.uuid().optional()),
    limit: z.coerce.number().int().min(1).max(24).default(12),
    cursor: z.preprocess(emptyToUndefined, z.string().min(1).max(512).optional()),
  })
  .strict();

export type AdminCategoryWrite = z.infer<typeof adminCategoryWriteSchema>;
export type AdminProductWrite = z.infer<typeof adminProductWriteSchema>;
export type AdminActiveWrite = z.infer<typeof adminActiveSchema>;
export type AdminListQuery = z.infer<typeof adminListQuerySchema>;

const BANNED_FIELDS = [
  "role",
  "role_id",
  "userId",
  "owner",
  "isActive",
  "is_active",
  "imagePath",
  "image_path",
  "stockAdjustment",
  "slug",
] as const;

export function rejectPrivilegedCatalogFields(body: unknown): void {
  if (!body || typeof body !== "object") {
    return;
  }

  const record = body as Record<string, unknown>;
  for (const field of BANNED_FIELDS) {
    if (field in record) {
      throw new AppError(
        "VALIDATION_ERROR",
        400,
        "The submitted data is invalid.",
        { fieldErrors: { [field]: ["This field cannot be set from the client."] } },
      );
    }
  }
}
