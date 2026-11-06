import { CheckoutForm } from "@/features/checkout/checkout-form";
import { ProtectedPage } from "@/server/auth/protect";
import { PageShell } from "@/ui/page-shell";
import { TextLink } from "@/ui/text-link";

export const instant = false;

export default function CheckoutPage() {
  return (
    <PageShell>
      <TextLink href="/cart" className="text-sm">
        Back to cart
      </TextLink>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Checkout
      </h1>
      <ProtectedPage returnTo="/checkout">
        <CheckoutForm />
      </ProtectedPage>
    </PageShell>
  );
}
