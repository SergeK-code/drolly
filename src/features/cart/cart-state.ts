export const CART_STORAGE_KEY = "drolly-cart";
export const MAX_CART_QUANTITY = 99;

export type CartSnapshot = {
  name: string;
  slug: string;
  priceMinor: number;
  currency: string;
  imagePath: string | null;
};

export type CartItem = {
  productId: string;
  quantity: number;
  snapshot: CartSnapshot;
};

export type CartLineStatus =
  | "available"
  | "limited"
  | "out_of_stock"
  | "unavailable";

export function clampCartQuantity(
  quantity: number,
  maxQuantity = MAX_CART_QUANTITY,
): number {
  const max = Math.max(1, Math.min(MAX_CART_QUANTITY, maxQuantity));
  return Math.min(max, Math.max(1, Math.trunc(quantity)));
}

export function addCartItem(
  items: CartItem[],
  input: {
    productId: string;
    snapshot: CartSnapshot;
    quantity?: number;
    maxQuantity?: number;
  },
): CartItem[] {
  const addQty = input.quantity ?? 1;
  const maxQuantity = input.maxQuantity ?? MAX_CART_QUANTITY;
  const existing = items.find((item) => item.productId === input.productId);

  if (!existing) {
    return [
      ...items,
      {
        productId: input.productId,
        quantity: clampCartQuantity(addQty, maxQuantity),
        snapshot: input.snapshot,
      },
    ];
  }

  return items.map((item) =>
    item.productId === input.productId
      ? {
          ...item,
          quantity: clampCartQuantity(item.quantity + addQty, maxQuantity),
          snapshot: input.snapshot,
        }
      : item,
  );
}

export function setCartItemQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
  maxQuantity = MAX_CART_QUANTITY,
): CartItem[] {
  if (quantity <= 0) {
    return removeCartItem(items, productId);
  }

  return items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: clampCartQuantity(quantity, maxQuantity) }
      : item,
  );
}

export function removeCartItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function cartLineStatus(
  live: { stockQuantity: number } | null | undefined,
  unavailable: boolean,
  quantity: number,
): CartLineStatus {
  if (unavailable) {
    return "unavailable";
  }

  if (!live) {
    return "available";
  }

  if (live.stockQuantity <= 0) {
    return "out_of_stock";
  }

  if (live.stockQuantity < quantity) {
    return "limited";
  }

  return "available";
}

export function displayLineTotalMinor(
  quantity: number,
  priceMinor: number,
  status: CartLineStatus,
): number {
  if (status === "unavailable" || status === "out_of_stock") {
    return 0;
  }

  return quantity * priceMinor;
}
