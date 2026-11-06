import { Suspense } from "react";
import { OrderDetail } from "@/ui/orders/order-detail";
import { BackLink } from "@/ui/text-link";

export const instant = false;

export default function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <BackLink href="/account/orders">Back to orders</BackLink>
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
