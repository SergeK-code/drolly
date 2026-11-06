"use client";

import { ApiError } from "@/lib/ui/api";
import { AddToCartButton } from "@/ui/cart/add-to-cart-button";
import { useProductQuery } from "@/features/catalog/hooks";
import type { PublicProduct } from "@/features/catalog/api";
import { catalogImageUrl } from "@/lib/ui/catalog-media";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";
import { EmptyState } from "@/ui/empty-state";
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
      <EmptyState
        title="This product is not available"
        description="It may be inactive or the link is out of date."
      />
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
  const inStock = product.stockQuantity > 0;

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid md:grid-cols-2">
        <MediaImage
          src={catalogImageUrl(product.slug, product.imagePath)}
          alt={product.name}
          className="aspect-square w-full md:min-h-96"
        />
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <p className="text-sm font-medium text-muted">{product.categoryName}</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold tracking-tight">{price}</p>
          {product.description ? (
            <p className="text-sm leading-6 text-muted sm:text-base sm:leading-7">
              {product.description}
            </p>
          ) : null}
          <Badge tone={inStock ? "success" : "neutral"} className="w-fit">
            {inStock ? `${product.stockQuantity} in stock` : "Out of stock"}
          </Badge>
          <div className="mt-auto pt-4">
            <AddToCartButton product={product} className="w-full sm:w-fit" />
          </div>
        </div>
      </div>
    </Card>
  );
}
