import { redirect } from "next/navigation";

export const instant = false;

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  redirect("/admin/products");
}
