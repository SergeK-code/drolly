import { z } from "zod";
import {
  categorySlugSchema,
  productSortSchema,
} from "@/lib/catalog-filters";

export { categorySlugSchema, productSortSchema };
export type { ProductSort } from "@/lib/catalog-filters";

export const DEFAULT_CATALOG_LIMIT = 12;
export const MAX_CATALOG_LIMIT = 24;

const emptyToUndefined = (value: unknown) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

export function slugFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return slug.length > 0 ? slug : "item";
}

export const productListQuerySchema = z
  .object({
    q: z.preprocess(emptyToUndefined, z.string().max(80).optional()),
    categoryId: z.preprocess(emptyToUndefined, z.uuid().optional()),
    category: z.preprocess(emptyToUndefined, categorySlugSchema.optional()),
    sort: z.preprocess(
      emptyToUndefined,
      productSortSchema.optional().default("newest"),
    ),
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_CATALOG_LIMIT)
      .default(DEFAULT_CATALOG_LIMIT),
    cursor: z.preprocess(emptyToUndefined, z.string().min(1).max(512).optional()),
    page: z.preprocess(
      emptyToUndefined,
      z.coerce.number().int().min(1).max(1000).optional(),
    ),
  })
  .strict()
  .refine((value) => !(value.cursor && value.page), {
    message: "Use either cursor or page, not both.",
    path: ["cursor"],
  })
  .refine((value) => !(value.categoryId && value.category), {
    message: "Use either categoryId or category, not both.",
    path: ["category"],
  });

export const categoryListQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(MAX_CATALOG_LIMIT)
      .default(DEFAULT_CATALOG_LIMIT),
    cursor: z.preprocess(emptyToUndefined, z.string().min(1).max(512).optional()),
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

export const productIdOrSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80);

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;
