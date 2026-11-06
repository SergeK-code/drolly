"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addCartItem,
  CART_STORAGE_KEY,
  removeCartItem,
  setCartItemQuantity,
  type CartItem,
  type CartSnapshot,
} from "@/features/cart/cart-state";

type CartStore = {
  items: CartItem[];
  drawerOpen: boolean;
  add: (input: {
    productId: string;
    snapshot: CartSnapshot;
    quantity?: number;
    maxQuantity?: number;
  }) => void;
  setQuantity: (productId: string, quantity: number, maxQuantity?: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

function memoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      add: (input) => set({ items: addCartItem(get().items, input) }),
      setQuantity: (productId, quantity, maxQuantity) =>
        set({
          items: setCartItemQuantity(
            get().items,
            productId,
            quantity,
            maxQuantity,
          ),
        }),
      remove: (productId) =>
        set({ items: removeCartItem(get().items, productId) }),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage() : localStorage,
      ),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
