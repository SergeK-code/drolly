"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { catalogImageUrl } from "@/lib/catalog-media";
import { fetchProduct } from "@/features/catalog/api";
import { catalogQueryKey } from "@/features/catalog/query-keys";
import {
  cartLineStatus,
  displayLineTotalMinor,
  type CartLineStatus,
} from "@/features/cart/cart-state";
import { useCart } from "@/features/cart/cart-store";
import { Button } from "@/ui/button";
import { MediaImage } from "@/ui/media-image";
import { TextLink } from "@/ui/text-link";

function formatMoney(priceMinor: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(priceMinor / 100);
}

export function CartView({ onContinue }: { onContinue?: () => void }) {
  const items = useCart((state) => state.items);
  const setQuantity = useCart((state) => state.setQuantity);
  const remove = useCart((state) => state.remove);
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: catalogQueryKey.product(item.productId),
      queryFn: () => fetchProduct(item.productId),
      retry: false,
    })),
  });

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted">Your cart is empty.</p>
        <TextLink href="/" onClick={onContinue}>
          Browse products
        </TextLink>
      </div>
    );
  }

  const lines = items.map((item, index) => {
    const query = queries[index];
    const live = query?.data?.product;
    const unavailable =
      query?.isError === true &&
      query.error instanceof ApiError &&
      query.error.code === "NOT_FOUND";
    const status = cartLineStatus(live, unavailable, item.quantity);
    const priceMinor = live?.priceMinor ?? item.snapshot.priceMinor;
    const billedQuantity =
      status === "limited" && live
        ? Math.min(item.quantity, live.stockQuantity)
        : item.quantity;

    return {
      item,
      live,
      status,
      priceMinor,
      query,
      lineTotal: displayLineTotalMinor(billedQuantity, priceMinor, status),
    };
  });

  const displayTotal = lines.reduce((total, line) => total + line.lineTotal, 0);
  const displayCurrency =
    lines.find((line) => line.live?.currency)?.live?.currency ??
    items[0]?.snapshot.currency ??
    "USD";
  const loading = queries.some((query) => query.isPending);

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {lines.map(({ item, live, status, priceMinor, query }) => (
          <li
            key={item.productId}
            className="flex gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0"
          >
            <MediaImage
              src={catalogImageUrl(
                live?.slug ?? item.snapshot.slug,
                live?.imagePath ?? item.snapshot.imagePath,
              )}
              alt=""
              className="h-20 w-20 shrink-0 rounded-md"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/products/${live?.slug ?? item.snapshot.slug}`}
                  onClick={onContinue}
                  className="font-medium leading-snug focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {live?.name ?? item.snapshot.name}
                </Link>
                <p className="shrink-0 text-sm">
                  {formatMoney(
                    priceMinor,
                    live?.currency ?? item.snapshot.currency,
                  )}
                </p>
              </div>
              <LineStatus status={status} stockQuantity={live?.stockQuantity} />
              {query?.isError && status !== "unavailable" ? (
                <p className="text-xs text-danger">
                  Could not refresh this product.
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                {status === "unavailable" || status === "out_of_stock" ? null : (
                  <QuantityControls
                    quantity={item.quantity}
                    max={live?.stockQuantity}
                    disabled={query?.isPending === true}
                    onChange={(quantity) =>
                      setQuantity(item.productId, quantity, live?.stockQuantity)
                    }
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(item.productId)}
                >
                  Remove
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-muted">Checking availability…</p>
        ) : null}
        <p className="flex items-baseline justify-between text-base font-medium">
          <span>Estimated total</span>
          <span>{formatMoney(displayTotal, displayCurrency)}</span>
        </p>
        <p className="text-xs text-muted">
          Prices and stock are checked again at checkout. This total is only a
          preview.
        </p>
      </div>
    </div>
  );
}

function LineStatus({
  status,
  stockQuantity,
}: {
  status: CartLineStatus;
  stockQuantity?: number;
}) {
  if (status === "unavailable") {
    return (
      <p className="text-xs text-danger">This product is no longer available.</p>
    );
  }

  if (status === "out_of_stock") {
    return <p className="text-xs text-danger">This product is out of stock.</p>;
  }

  if (status === "limited") {
    return (
      <p className="text-xs text-muted">
        Only {stockQuantity} left. Extra items will not be sold.
      </p>
    );
  }

  return null;
}

function QuantityControls({
  quantity,
  max,
  disabled,
  onChange,
}: {
  quantity: number;
  max?: number;
  disabled: boolean;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <Button
        variant="secondary"
        size="sm"
        aria-label="Decrease quantity"
        disabled={disabled || quantity <= 1}
        onClick={() => onChange(quantity - 1)}
      >
        −
      </Button>
      <span className="min-w-8 text-center text-sm" aria-live="polite">
        {quantity}
      </span>
      <Button
        variant="secondary"
        size="sm"
        aria-label="Increase quantity"
        disabled={disabled || (max !== undefined && quantity >= max)}
        onClick={() => onChange(quantity + 1)}
      >
        +
      </Button>
    </div>
  );
}
