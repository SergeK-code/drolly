import { Suspense } from "react";
import { AdminOrderDetail } from "@/features/admin-orders/order-detail";
import { TextLink } from "@/ui/text-link";

export const instant = false;

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <TextLink href="/admin/orders" className="text-sm">
        Back to orders
      </TextLink>
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
