"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  catalogFiltersFromSearchParams,
  catalogHref,
} from "@/features/catalog/catalog-params";
import {
  useCategoriesQuery,
  useProductListQuery,
} from "@/features/catalog/hooks";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import type { PublicProduct } from "@/features/catalog/api";
import { catalogImageUrl } from "@/lib/catalog-media";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { ErrorRetry } from "@/ui/error-retry";
import { Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";
import { Field } from "@/ui/field";
import { MediaImage } from "@/ui/media-image";
import { cx } from "@/ui/cx";
import type { ProductSort } from "@/server/catalog/schemas";

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

  useEffect(() => {
    if (debouncedSearch === filters.q) {
      return;
    }

    router.replace(
      catalogHref({
        q: debouncedSearch,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Field id="catalog-search" label="Search products">
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

      <div className="flex flex-wrap gap-2">
        <CategoryChip
          label="All"
          href={catalogHref({ ...hrefFilters, category: undefined })}
          selected={!filters.category}
        />
        {categoriesQuery.isPending
          ? null
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

      {productsQuery.isPending ? (
        <ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy="true"
        >
          <li className="h-64 rounded-lg bg-border/70" />
          <li className="h-64 rounded-lg bg-border/70" />
          <li className="hidden h-64 rounded-lg bg-border/70 lg:block" />
        </ul>
      ) : null}

      {productsQuery.isError ? (
        <ErrorRetry
          message="Could not load products."
          onRetry={() => void productsQuery.refetch()}
        />
      ) : null}

      {productsQuery.isSuccess && products.length === 0 ? (
        <p className="text-sm text-muted">
          {filters.q || filters.category
            ? "No products match your search."
            : "No products are available yet."}
        </p>
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
        "inline-flex min-h-9 items-center rounded-full px-3 text-xs font-medium",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        selected
          ? "bg-accent text-accent-foreground shadow-sm"
          : "bg-surface text-foreground shadow-sm ring-1 ring-border hover:bg-background",
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
          className="flex flex-1 flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <MediaImage
            src={catalogImageUrl(product.slug, product.imagePath)}
            alt=""
            className="aspect-[4/3] w-full"
          />
          <div className="flex flex-1 flex-col gap-1 p-4">
            <h2 className="text-base font-semibold leading-snug">
              {product.name}
            </h2>
            <p className="text-sm text-muted">{product.categoryName}</p>
            <p className="mt-auto pt-2 text-sm font-medium">{price}</p>
            {product.stockQuantity <= 0 ? (
              <p className="text-xs text-muted">Out of stock</p>
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
