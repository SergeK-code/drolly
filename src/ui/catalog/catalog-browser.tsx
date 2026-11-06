"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  catalogFiltersFromSearchParams,
  catalogHref,
} from "@/lib/ui/catalog-params";
import {
  useCategoriesQuery,
  useProductListQuery,
} from "@/features/catalog/hooks";
import { AddToCartButton } from "@/ui/cart/add-to-cart-button";
import type { PublicProduct } from "@/features/catalog/api";
import { catalogImageUrl } from "@/lib/ui/catalog-media";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { EmptyState } from "@/ui/empty-state";
import { ErrorRetry } from "@/ui/error-retry";
import { CatalogSkeleton, Skeleton } from "@/ui/skeleton";
import { Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";
import { Field } from "@/ui/field";
import { MediaImage } from "@/ui/media-image";
import { cx } from "@/lib/ui/cx";
import {
  catalogSearchQuerySchema,
  type ProductSort,
} from "@/lib/catalog-filters";

function useDebouncedValue(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

function formatPrice(product: PublicProduct): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: product.currency,
  }).format(product.priceMinor / 100);
}

export function CatalogBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = catalogFiltersFromSearchParams(searchParams);
  const [searchInput, setSearchInput] = useState(filters.q);
  const [urlQuery, setUrlQuery] = useState(filters.q);
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 300);

  if (filters.q !== urlQuery) {
    setUrlQuery(filters.q);
    setSearchInput(filters.q);
  }

  const searchResult = catalogSearchQuerySchema.safeParse(searchInput);
  const searchError = searchResult.success
    ? undefined
    : searchResult.error.issues[0]?.message;

  useEffect(() => {
    const parsed = catalogSearchQuerySchema.safeParse(debouncedSearch);
    if (!parsed.success || parsed.data === filters.q) {
      return;
    }

    router.replace(
      catalogHref({
        q: parsed.data,
        category: filters.category,
        sort: filters.sort,
      }),
      { scroll: false },
    );
  }, [debouncedSearch, filters.category, filters.q, filters.sort, router]);

  const categoriesQuery = useCategoriesQuery();
  const productsQuery = useProductListQuery({
    q: filters.q,
    category: filters.category,
    sort: filters.sort,
  });

  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data],
  );
  const hrefFilters = {
    q: searchInput.trim(),
    category: filters.category,
    sort: filters.sort,
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-4 bg-background/95 px-4 py-3 sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <Field id="catalog-search" label="Search products" error={searchError}>
          <Input
            id="catalog-search"
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name"
            className="w-full sm:max-w-md"
          />
        </Field>
        <Field id="catalog-sort" label="Sort">
          <Dropdown
            id="catalog-sort"
            className="w-full sm:w-56"
            align="end"
            value={filters.sort}
            options={SORT_OPTIONS}
            onChange={(sort) =>
              router.replace(catalogHref({ ...hrefFilters, sort }), {
                scroll: false,
              })
            }
          />
        </Field>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        <CategoryChip
          label="All"
          href={catalogHref({ ...hrefFilters, category: undefined })}
          selected={!filters.category}
        />
        {categoriesQuery.isPending
          ? [0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-11 w-24 shrink-0 rounded-full" />
            ))
          : categoriesQuery.data?.items.map((category) => (
              <CategoryChip
                key={category.id}
                label={category.name}
                href={catalogHref({ ...hrefFilters, category: category.slug })}
                selected={filters.category === category.slug}
              />
            ))}
      </div>

      {categoriesQuery.isError ? (
        <ErrorRetry
          message="Could not load categories."
          onRetry={() => void categoriesQuery.refetch()}
        />
      ) : null}

      {productsQuery.isPending ? <CatalogSkeleton /> : null}

      {productsQuery.isError ? (
        <ErrorRetry
          message="Could not load products."
          onRetry={() => void productsQuery.refetch()}
        />
      ) : null}

      {productsQuery.isSuccess && products.length === 0 ? (
        <EmptyState
          title={
            filters.q || filters.category
              ? "No products match your search."
              : "No products are available yet."
          }
          description="Try another category or clear the search to see the full catalog."
        />
      ) : null}

      {products.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} price={formatPrice(product)} />
            </li>
          ))}
        </ul>
      ) : null}

      {productsQuery.hasNextPage ? (
        <Button
          variant="secondary"
          onClick={() => void productsQuery.fetchNextPage()}
          disabled={productsQuery.isFetchingNextPage}
          className="w-fit"
        >
          {productsQuery.isFetchingNextPage ? "Loading more…" : "Load more"}
        </Button>
      ) : null}
    </section>
  );
}

function CategoryChip({
  label,
  href,
  selected,
}: {
  label: string;
  href: string;
  selected: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={selected ? "page" : undefined}
      className={cx(
        "inline-flex min-h-11 shrink-0 items-center rounded-full px-3.5 text-sm font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "bg-accent text-accent-foreground shadow-sm"
          : "bg-surface text-foreground ring-1 ring-border hover:bg-muted-bg",
      )}
    >
      {label}
    </Link>
  );
}

function ProductCard({
  product,
  price,
}: {
  product: PublicProduct;
  price: string;
}) {
  return (
    <Card hover className="h-full overflow-hidden p-0">
      <article className="flex h-full flex-col">
        <Link
          href={`/products/${product.slug}`}
          className="group flex flex-1 flex-col focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <MediaImage
            src={catalogImageUrl(product.slug, product.imagePath)}
            alt=""
            className="aspect-4/3 w-full"
          />
          <div className="flex flex-1 flex-col gap-1 p-4">
            <h2 className="text-base font-semibold leading-snug tracking-tight">
              {product.name}
            </h2>
            <p className="text-sm text-muted">{product.categoryName}</p>
            <p className="mt-auto pt-3 text-base font-semibold tracking-tight">
              {price}
            </p>
            {product.stockQuantity <= 0 ? (
              <Badge tone="neutral" className="mt-1 w-fit">
                Out of stock
              </Badge>
            ) : null}
          </div>
        </Link>
        <div className="px-4 pb-4">
          <AddToCartButton product={product} className="w-full" />
        </div>
      </article>
    </Card>
  );
}
