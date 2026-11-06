import { redirect } from "next/navigation";

export const instant = false;

export default async function AdminCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/admin/categories");
}
