import { AdminPanel, AdminTableCard } from "@/ui/admin/admin-panel";

export function PlaceholderTable({
  title,
  description,
  columns,
  emptyMessage,
}: {
  title: string;
  description: string;
  columns: string[];
  emptyMessage: string;
}) {
  return (
    <AdminPanel title={title} description={description}>
      <AdminTableCard>
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <p className="px-4 py-8 text-sm text-muted">{emptyMessage}</p>
      </AdminTableCard>
    </AdminPanel>
  );
}
