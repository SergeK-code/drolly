"use client";

import { useCart } from "@/features/cart/cart-store";
import type { PublicProduct } from "@/features/catalog/api";
import { Button } from "@/ui/button";
import { useToast } from "@/ui/toast";

export function AddToCartButton({
  product,
  className,
}: {
  product: PublicProduct;
  className?: string;
}) {
  const add = useCart((state) => state.add);
  const openDrawer = useCart((state) => state.openDrawer);
  const { showToast } = useToast();
  const outOfStock = product.stockQuantity <= 0;

  return (
    <Button
      className={className}
      disabled={outOfStock}
      onClick={() => {
        add({
          productId: product.id,
          quantity: 1,
          maxQuantity: product.stockQuantity,
          snapshot: {
            name: product.name,
            slug: product.slug,
            priceMinor: product.priceMinor,
            currency: product.currency,
            imagePath: product.imagePath,
          },
        });
        openDrawer();
        showToast("success", `${product.name} added to cart.`);
      }}
    >
      {outOfStock ? "Out of stock" : "Add to cart"}
    </Button>
  );
}
