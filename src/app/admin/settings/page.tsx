import { PlaceholderTable } from "@/features/admin/placeholder-table";

export default function AdminSettingsPage() {
  return (
    <PlaceholderTable
      title="Store settings"
      description="Store name, fees, and contact details arrive in a later phase."
      columns={["Setting", "Value", "Actions"]}
      emptyMessage="No store settings yet."
    />
  );
}
