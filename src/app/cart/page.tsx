import { CartView } from "@/features/cart/cart-view";
import { PageShell } from "@/ui/page-shell";
import { TextLink } from "@/ui/text-link";

export default function CartPage() {
  return (
    <PageShell>
      <TextLink href="/" className="text-sm">
        Back to catalog
      </TextLink>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Cart</h1>
      <CartView />
    </PageShell>
  );
}
