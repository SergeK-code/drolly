import { AdminOrderDetail } from "@/features/admin-orders/order-detail";
import { TextLink } from "@/ui/text-link";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <TextLink href="/admin/orders" className="text-sm">
        Back to orders
      </TextLink>
      <AdminOrderDetail orderId={id} />
    </div>
  );
}
