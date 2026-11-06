import { OrderDetail } from "@/features/orders/order-detail";
import { TextLink } from "@/ui/text-link";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <TextLink href="/account/orders" className="text-sm">
        Back to orders
      </TextLink>
      <h2 className="text-lg font-semibold">Order</h2>
      <OrderDetail orderId={id} />
    </>
  );
}
