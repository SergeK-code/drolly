import { z } from "zod";

export const categorySlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Enter a valid slug.");

export const productSortSchema = z.enum([
  "newest",
  "price-asc",
  "price-desc",
  "name-asc",
  "name-desc",
]);

export type ProductSort = z.infer<typeof productSortSchema>;
