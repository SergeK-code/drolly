import type { CatalogCategoryRow, CatalogProductRow } from "@/server/catalog/public";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  imagePath: string | null;
};

export type AdminProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  name: string;
  slug: string;
  description: string | null;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  isActive: boolean;
  imagePath: string | null;
};

export function toAdminCategory(row: CatalogCategoryRow): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    imagePath: row.imagePath,
  };
}

export function toAdminProduct(row: CatalogProductRow): AdminProduct {
  return {
    id: row.id,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    name: row.name,
    slug: row.slug,
    description: row.description,
    priceMinor: row.priceMinor,
    currency: row.currency,
    stockQuantity: row.stockQuantity,
    isActive: row.isActive,
    imagePath: row.imagePath,
  };
}
