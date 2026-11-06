import { describe, expect, it } from "vitest";
import {
  addCartItem,
  alignCartQuantities,
  cartItemCount,
  cartLineStatus,
  displayLineTotalMinor,
  MAX_CART_LINES,
  parsePersistedCartItems,
  removeCartItem,
  setCartItemQuantity,
  type CartItem,
} from "@/features/cart/cart-state";

const teaId = "11111111-1111-4111-8111-111111111111";

const tea: CartItem = {
  productId: teaId,
  quantity: 1,
  snapshot: {
    name: "Mint tea",
    slug: "mint-tea",
    priceMinor: 1500,
    currency: "USD",
    imagePath: null,
  },
};

describe("cart state", () => {
  it("adds a new line and increments an existing one", () => {
    const withTea = addCartItem([], {
      productId: tea.productId,
      snapshot: tea.snapshot,
    });
    expect(withTea).toEqual([tea]);

    const two = addCartItem(withTea, {
      productId: tea.productId,
      snapshot: tea.snapshot,
      quantity: 2,
    });
    expect(two[0]?.quantity).toBe(3);
    expect(cartItemCount(two)).toBe(3);
  });

  it("clamps quantity to stock and removes at zero", () => {
    const limited = addCartItem([], {
      productId: tea.productId,
      snapshot: tea.snapshot,
      quantity: 8,
      maxQuantity: 4,
    });
    expect(limited[0]?.quantity).toBe(4);

    expect(setCartItemQuantity(limited, tea.productId, 2, 4)[0]?.quantity).toBe(
      2,
    );
    expect(setCartItemQuantity(limited, tea.productId, 0)).toEqual([]);
    expect(removeCartItem(limited, tea.productId)).toEqual([]);
  });

  it("does not add a new line past the cart size limit", () => {
    const full: CartItem[] = Array.from({ length: MAX_CART_LINES }, (_, index) => ({
      ...tea,
      productId: `11111111-1111-4111-8111-${String(index).padStart(12, "0")}`,
    }));

    expect(
      addCartItem(full, { productId: teaId, snapshot: tea.snapshot }).length,
    ).toBe(MAX_CART_LINES);
  });

  it("marks inactive, unknown, pending and low-stock lines", () => {
    expect(cartLineStatus(undefined, "not_found", 1)).toBe("unavailable");
    expect(cartLineStatus(undefined, "error", 1)).toBe("unknown");
    expect(cartLineStatus(undefined, "pending", 1)).toBe("pending");
    expect(cartLineStatus({ stockQuantity: 0 }, "live", 1)).toBe("out_of_stock");
    expect(cartLineStatus({ stockQuantity: 1 }, "live", 3)).toBe("limited");
    expect(cartLineStatus({ stockQuantity: 5 }, "live", 2)).toBe("available");
  });

  it("keeps display totals off unavailable, unknown and pending lines", () => {
    expect(displayLineTotalMinor(2, 1500, "available")).toBe(3000);
    expect(displayLineTotalMinor(2, 1500, "unavailable")).toBe(0);
    expect(displayLineTotalMinor(2, 1500, "out_of_stock")).toBe(0);
    expect(displayLineTotalMinor(2, 1500, "unknown")).toBe(0);
    expect(displayLineTotalMinor(2, 1500, "pending")).toBe(0);
  });

  it("clamps stored quantity down to live stock", () => {
    const aligned = alignCartQuantities([{ ...tea, quantity: 5 }], new Map([[teaId, 2]]));
    expect(aligned[0]?.quantity).toBe(2);
  });

  it("drops invalid persisted cart entries", () => {
    expect(parsePersistedCartItems("nope")).toEqual([]);
    expect(
      parsePersistedCartItems([
        tea,
        { productId: "not-a-uuid", quantity: 1, snapshot: tea.snapshot },
        { ...tea, quantity: Number.POSITIVE_INFINITY },
        { ...tea, snapshot: { ...tea.snapshot, currency: "usd" } },
      ]),
    ).toEqual([tea]);
  });
});
