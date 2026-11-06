import { Suspense } from "react";
import { AdminOrderDetail } from "@/features/admin-orders/order-detail";
import { BackLink } from "@/ui/text-link";

export const instant = false;

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <BackLink href="/admin/orders">Back to orders</BackLink>
      <Suspense fallback={<p className="text-sm text-muted">Loading order…</p>}>
        <AdminOrderFromParams params={params} />
      </Suspense>
    </div>
  );
}

async function AdminOrderFromParams({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminOrderDetail orderId={id} />;
}
