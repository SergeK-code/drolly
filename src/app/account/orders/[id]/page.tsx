import { Suspense } from "react";
import { OrderDetail } from "@/features/orders/order-detail";
import { TextLink } from "@/ui/text-link";

export const instant = false;

export default function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <TextLink href="/account/orders" className="text-sm">
        Back to orders
      </TextLink>
      <h2 className="text-lg font-semibold">Order</h2>
      <Suspense fallback={<p className="text-sm text-muted">Loading order…</p>}>
        <AccountOrderFromParams params={params} />
      </Suspense>
    </>
  );
}

async function AccountOrderFromParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetail orderId={id} />;
}
