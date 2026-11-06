"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { catalogImageUrl } from "@/lib/catalog-media";
import { fetchProduct } from "@/features/catalog/api";
import { catalogQueryKey } from "@/features/catalog/query-keys";
import {
  alignCartQuantities,
  cartLineStatus,
  displayLineTotalMinor,
  type CartLineStatus,
  type CartRefreshState,
} from "@/features/cart/cart-state";
import { useCart } from "@/features/cart/cart-store";
import { Minus, Plus } from "lucide-react";
import { Button, ButtonLink } from "@/ui/button";
import { Icon } from "@/ui/icon";
import { ConfirmModal } from "@/ui/confirm-modal";
import { EmptyState } from "@/ui/empty-state";
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
  const replaceItems = useCart((state) => state.replaceItems);
  const clear = useCart((state) => state.clear);
  const [confirmClear, setConfirmClear] = useState(false);
  const queries = useQueries({
    queries: items.map((item) => ({
      queryKey: catalogQueryKey.product(item.productId),
      queryFn: () => fetchProduct(item.productId),
      retry: false,
    })),
  });
  const stockSignature = items
    .map((item, index) => {
      const stock = queries[index]?.data?.product?.stockQuantity;
      return `${item.productId}:${typeof stock === "number" ? stock : ""}`;
    })
    .join("|");

  useEffect(() => {
    const liveStock = new Map<string, number>();

    for (const part of stockSignature.split("|")) {
      if (!part) {
        continue;
      }

      const [productId, stockText] = part.split(":");
      if (!productId || stockText === undefined || stockText.length === 0) {
        continue;
      }

      liveStock.set(productId, Number(stockText));
    }

    if (liveStock.size === 0) {
      return;
    }

    const next = alignCartQuantities(items, liveStock);
    const changed = next.some(
      (item, index) => item.quantity !== items[index]?.quantity,
    );
    if (changed) {
      replaceItems(next);
    }
  }, [items, replaceItems, stockSignature]);

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty."
        description="Add products from the catalog, then return here to check out."
        action={
          <TextLink href="/" onClick={onContinue}>
            Browse products
          </TextLink>
        }
      />
    );
  }

  const lines = items.map((item, index) => {
    const query = queries[index];
    const live = query?.data?.product;
    const refresh = refreshState(query);
    const status = cartLineStatus(live, refresh, item.quantity);
    const priceMinor = live?.priceMinor ?? item.snapshot.priceMinor;
    const billedQuantity =
      status === "limited" && live
        ? Math.min(item.quantity, live.stockQuantity)
        : item.quantity;
    const currency = live?.currency ?? item.snapshot.currency;

    return {
      item,
      live,
      status,
      priceMinor,
      currency,
      query,
      lineTotal: displayLineTotalMinor(billedQuantity, priceMinor, status),
    };
  });

  const priced = lines.filter(
    (line) => line.status === "available" || line.status === "limited",
  );
  const currencies = new Set(priced.map((line) => line.currency));
  const displayCurrency = currencies.size === 1 ? [...currencies][0] : null;
  const displayTotal = priced.reduce(
    (total, line) => total + line.lineTotal,
    0,
  );
  const loading = queries.some((query) => query.isPending);

  return (
    <div className="flex flex-col gap-5">
      <ul className="flex flex-col gap-4">
        {lines.map(({ item, live, status, priceMinor, currency, query }) => (
          <li
            key={item.productId}
            className="flex gap-4 rounded-lg bg-surface p-3 ring-1 ring-border"
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
                  {formatMoney(priceMinor, currency)}
                </p>
              </div>
              <LineStatus status={status} stockQuantity={live?.stockQuantity} />
              <div className="flex flex-wrap items-center gap-2">
                {status === "unavailable" ||
                status === "out_of_stock" ||
                status === "unknown" ? null : (
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

      <div className="flex flex-col gap-3 rounded-lg bg-muted-bg/80 p-4 ring-1 ring-border">
        {loading ? (
          <p className="text-sm text-muted">Checking availability…</p>
        ) : null}
        <p className="flex items-baseline justify-between text-base font-medium">
          <span>Estimated total</span>
          <span>
            {!loading && displayCurrency
              ? formatMoney(displayTotal, displayCurrency)
              : "—"}
          </span>
        </p>
        <p className="text-xs text-muted">
          {!loading && !displayCurrency && priced.length > 0
            ? "A single estimated total is unavailable until product prices can be refreshed in one currency."
            : "Prices and stock are checked again at checkout. This total is only a preview."}
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/checkout" onClick={onContinue}>
            Checkout
          </ButtonLink>
          <Button
            variant="secondary"
            size="sm"
            className="w-fit"
            onClick={() => setConfirmClear(true)}
          >
            Clear cart
          </Button>
        </div>
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear cart"
        message="Remove all items from your cart?"
        confirmLabel="Clear cart"
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clear();
          setConfirmClear(false);
        }}
      />
    </div>
  );
}

function refreshState(
  query:
    | {
        isPending: boolean;
        isError: boolean;
        error: unknown;
      }
    | undefined,
): CartRefreshState {
  if (!query || query.isPending) {
    return "pending";
  }

  if (query.isError) {
    return query.error instanceof ApiError && query.error.code === "NOT_FOUND"
      ? "not_found"
      : "error";
  }

  return "live";
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
      <p className="text-xs text-danger">
        This product is no longer available.
      </p>
    );
  }

  if (status === "out_of_stock") {
    return <p className="text-xs text-danger">This product is out of stock.</p>;
  }

  if (status === "unknown") {
    return (
      <p className="text-xs text-danger">Could not refresh this product.</p>
    );
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
        <Icon icon={Minus} />
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
        <Icon icon={Plus} />
      </Button>
    </div>
  );
}
