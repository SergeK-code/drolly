import { describe, expect, it } from "vitest";
import {
  addCartItem,
  cartItemCount,
  cartLineStatus,
  displayLineTotalMinor,
  removeCartItem,
  setCartItemQuantity,
  type CartItem,
} from "@/features/cart/cart-state";

const tea: CartItem = {
  productId: "tea-id",
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

  it("marks inactive or missing products as unavailable", () => {
    expect(cartLineStatus(undefined, true, 1)).toBe("unavailable");
    expect(cartLineStatus({ stockQuantity: 0 }, false, 1)).toBe("out_of_stock");
    expect(cartLineStatus({ stockQuantity: 1 }, false, 3)).toBe("limited");
    expect(cartLineStatus({ stockQuantity: 5 }, false, 2)).toBe("available");
  });

  it("keeps display totals off unavailable lines", () => {
    expect(displayLineTotalMinor(2, 1500, "available")).toBe(3000);
    expect(displayLineTotalMinor(2, 1500, "unavailable")).toBe(0);
    expect(displayLineTotalMinor(2, 1500, "out_of_stock")).toBe(0);
  });
});
