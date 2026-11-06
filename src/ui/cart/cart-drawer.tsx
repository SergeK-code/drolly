"use client";

import { CartView } from "@/ui/cart/cart-view";
import { useCart } from "@/features/cart/cart-store";
import { Button, ButtonLink } from "@/ui/button";
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
        <ButtonLink href="/cart" onClick={closeDrawer}>
          View cart
        </ButtonLink>
      </div>
    </Modal>
  );
}
