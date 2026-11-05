import { PlaceholderTable } from "@/features/admin/placeholder-table";

export default function AdminOrdersPage() {
  return (
    <PlaceholderTable
      title="Orders"
      description="Order management arrives in a later phase. This table is ready for those records."
      columns={["Order", "Customer", "Status", "Total", "Actions"]}
      emptyMessage="No orders yet."
    />
  );
}
