import { parseApiResponse } from "@/lib/ui/api";
import type { PublicOrder } from "@/features/orders/api";

export async function placeOrder(input: {
  idempotencyKey: string;
  items: { productId: string; quantity: number }[];
  addressId?: string;
  address?: {
    recipientName: string;
    phone: string;
    addressLine: string;
    area: string;
    notes?: string | null;
  };
}): Promise<{ order: PublicOrder }> {
  const response = await fetch("/api/checkout", {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseApiResponse(response);
}
