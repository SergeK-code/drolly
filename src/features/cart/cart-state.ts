export const CART_STORAGE_KEY = "drolly-cart";
export const MAX_CART_QUANTITY = 99;
export const MAX_CART_LINES = 50;

const PRODUCT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  | "pending"
  | "available"
  | "limited"
  | "out_of_stock"
  | "unavailable"
  | "unknown";

export type CartRefreshState = "pending" | "live" | "not_found" | "error";

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
    if (items.length >= MAX_CART_LINES) {
      return items;
    }

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
  refresh: CartRefreshState,
  quantity: number,
): CartLineStatus {
  if (refresh === "not_found") {
    return "unavailable";
  }

  if (refresh === "error") {
    return "unknown";
  }

  if (refresh === "pending" || !live) {
    return "pending";
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
  if (
    status === "unavailable" ||
    status === "out_of_stock" ||
    status === "unknown" ||
    status === "pending"
  ) {
    return 0;
  }

  return quantity * priceMinor;
}

export function alignCartQuantities(
  items: CartItem[],
  liveStockById: ReadonlyMap<string, number>,
): CartItem[] {
  return items.map((item) => {
    const stock = liveStockById.get(item.productId);
    if (stock === undefined || stock <= 0 || item.quantity <= stock) {
      return item;
    }

    return {
      ...item,
      quantity: clampCartQuantity(item.quantity, stock),
    };
  });
}

export function parsePersistedCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const items: CartItem[] = [];
  const seen = new Set<string>();

  for (const entry of value) {
    if (items.length >= MAX_CART_LINES) {
      break;
    }

    const item = parseCartItem(entry);
    if (!item || seen.has(item.productId)) {
      continue;
    }

    seen.add(item.productId);
    items.push(item);
  }

  return items;
}

function parseCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.productId !== "string" || !PRODUCT_ID_PATTERN.test(record.productId)) {
    return null;
  }

  if (typeof record.quantity !== "number" || !Number.isFinite(record.quantity)) {
    return null;
  }

  const snapshot = parseSnapshot(record.snapshot);
  if (!snapshot) {
    return null;
  }

  return {
    productId: record.productId,
    quantity: clampCartQuantity(record.quantity),
    snapshot,
  };
}

function parseSnapshot(value: unknown): CartSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string" || record.name.trim().length === 0) {
    return null;
  }

  if (typeof record.slug !== "string" || record.slug.trim().length === 0) {
    return null;
  }

  if (typeof record.priceMinor !== "number" || !Number.isFinite(record.priceMinor) || record.priceMinor < 0) {
    return null;
  }

  if (typeof record.currency !== "string" || !/^[A-Z]{3}$/.test(record.currency)) {
    return null;
  }

  if (record.imagePath !== null && typeof record.imagePath !== "string") {
    return null;
  }

  return {
    name: record.name.trim().slice(0, 120),
    slug: record.slug.trim().slice(0, 80),
    priceMinor: Math.trunc(record.priceMinor),
    currency: record.currency,
    imagePath: record.imagePath,
  };
}
