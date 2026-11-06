import { z } from "zod";
import { validationFailed } from "@/server/http/api";

export {
  adminCategoryWriteSchema,
  adminProductWriteSchema,
  type AdminCategoryWrite,
  type AdminProductWrite,
} from "@/lib/admin-catalog-schemas";

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export const adminIdSchema = z.uuid("This item was not found.");

export const adminActiveSchema = z
  .object({
    isActive: z.boolean({ error: "Choose active or archived." }),
  })
  .strict();

export const adminListQuerySchema = z
  .object({
    q: z.preprocess(
      emptyToUndefined,
      z.string().max(80, "Search is limited to 80 characters.").optional(),
    ),
    categoryId: z.preprocess(
      emptyToUndefined,
      z.uuid("Choose a valid category.").optional(),
    ),
    limit: z.coerce.number().int().min(1).max(24).default(12),
    cursor: z.preprocess(
      emptyToUndefined,
      z.string().min(1).max(512).optional(),
    ),
  })
  .strict();

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
      throw validationFailed({
        [field]: ["This field cannot be set from the client."],
      });
    }
  }
}
