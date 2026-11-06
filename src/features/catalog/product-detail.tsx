"use client";

import { ApiError } from "@/lib/api";
import { AddToCartButton } from "@/features/cart/add-to-cart-button";
import { useProductQuery } from "@/features/catalog/hooks";
import type { PublicProduct } from "@/features/catalog/api";
import { catalogImageUrl } from "@/lib/catalog-media";
import { Card } from "@/ui/card";
import { QueryState } from "@/ui/error-retry";
import { MediaImage } from "@/ui/media-image";

export function ProductDetail({ slug }: { slug: string }) {
  const query = useProductQuery(slug);
  const notFound =
    query.isError &&
    query.error instanceof ApiError &&
    query.error.code === "NOT_FOUND";

  if (notFound) {
    return (
      <p className="text-base text-muted">This product is not available.</p>
    );
  }

  return (
    <QueryState
      isPending={query.isPending}
      isError={query.isError}
      pendingMessage="Loading product…"
      errorMessage="Could not load this product."
      onRetry={() => void query.refetch()}
    >
      {query.data ? <ProductDetailBody product={query.data.product} /> : null}
    </QueryState>
  );
}

function ProductDetailBody({ product }: { product: PublicProduct }) {
  const price = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: product.currency,
  }).format(product.priceMinor / 100);

  return (
    <Card className="overflow-hidden p-0">
      <MediaImage
        src={catalogImageUrl(product.slug, product.imagePath)}
        alt={product.name}
        className="aspect-video w-full"
      />
      <div className="flex flex-col gap-3 p-5 sm:p-6">
        <p className="text-sm text-muted">{product.categoryName}</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {product.name}
        </h1>
        <p className="text-lg font-medium">{price}</p>
        {product.description ? (
          <p className="text-sm leading-6 text-muted sm:text-base sm:leading-7">
            {product.description}
          </p>
        ) : null}
        <p className="text-sm text-muted">
          {product.stockQuantity > 0
            ? `${product.stockQuantity} in stock`
            : "Out of stock"}
        </p>
        <AddToCartButton product={product} className="w-fit" />
      </div>
    </Card>
  );
}
