import { CheckoutForm } from "@/features/checkout/checkout-form";
import { ProtectedPage } from "@/server/auth/protect";
import { PageShell } from "@/ui/page-shell";
import { BackLink } from "@/ui/text-link";

export const instant = false;

export default function CheckoutPage() {
  return (
    <PageShell>
      <BackLink href="/cart">Back to cart</BackLink>
      <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
      <p className="text-sm text-muted">
        Review your items and delivery details. Totals are calculated on the
        server. Payment is cash on delivery.
      </p>
      <ProtectedPage returnTo="/checkout">
        <CheckoutForm />
      </ProtectedPage>
    </PageShell>
  );
}
