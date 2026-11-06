import { OrderList } from "@/features/orders/order-list";

export const instant = false;

export default function AccountOrdersPage() {
  return (
    <>
      <h2 className="text-lg font-semibold">Orders</h2>
      <OrderList />
    </>
  );
}
