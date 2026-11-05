export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
};

export type PublicProduct = {
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
  imagePath: string | null;
};

export type CatalogCategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type CatalogProductRow = {
  id: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  categoryIsActive: boolean;
  name: string;
  slug: string;
  description: string | null;
  priceMinor: number;
  currency: string;
  stockQuantity: number;
  imagePath: string | null;
  isActive: boolean;
  createdAt: string;
};

export function isPublicCategoryRow(row: CatalogCategoryRow): boolean {
  return row.isActive;
}

export function isPublicProductRow(row: CatalogProductRow): boolean {
  return row.isActive && row.categoryIsActive;
}

export function toPublicCategory(row: CatalogCategoryRow): PublicCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    imagePath: row.imagePath,
  };
}

export function toPublicProduct(row: CatalogProductRow): PublicProduct {
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
    imagePath: row.imagePath,
  };
}

export function sanitizeSearchTerm(value: string): string | undefined {
  const cleaned = value
    .replace(/[%_,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned : undefined;
}
