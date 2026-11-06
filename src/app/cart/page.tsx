import { CartView } from "@/ui/cart/cart-view";
import { PageShell } from "@/ui/page-shell";
import { BackLink } from "@/ui/text-link";

export default function CartPage() {
  return (
    <PageShell>
      <BackLink href="/">Back to catalog</BackLink>
      <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
      <CartView />
    </PageShell>
  );
}
