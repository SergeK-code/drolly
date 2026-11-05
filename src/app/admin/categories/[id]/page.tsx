import { redirect } from "next/navigation";

export default async function AdminCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/admin/categories");
}
