import { redirect } from "next/navigation";

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/admin/products");
}
