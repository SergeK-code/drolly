"use client";

import Link from "next/link";
import { CartView } from "@/features/cart/cart-view";
import { useCart } from "@/features/cart/cart-store";
import { Button } from "@/ui/button";
import { Modal } from "@/ui/modal";

export function CartDrawer() {
  const open = useCart((state) => state.drawerOpen);
  const closeDrawer = useCart((state) => state.closeDrawer);

  return (
    <Modal open={open} title="Cart" closeButton onClose={closeDrawer}>
      <CartView onContinue={closeDrawer} />
      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={closeDrawer}>
          Keep shopping
        </Button>
        <Link
          href="/cart"
          onClick={closeDrawer}
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground shadow-sm hover:bg-accent-hover focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          View cart
        </Link>
      </div>
    </Modal>
  );
}
