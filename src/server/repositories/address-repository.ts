import "server-only";

import { conflict, serviceUnavailable } from "@/server/http/api";
import { logger } from "@/server/logging/logger";
import { toPublicAddress, type PublicAddress } from "@/server/orders/public";
import type { AddressWriteInput } from "@/server/orders/schemas";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export async function listAddresses(userId: string): Promise<PublicAddress[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .select(
      "id, label, recipient_name, phone, address_line, area, notes, is_default",
    )
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    logger.warn({ code: error.code }, "Address list failed");
    throw serviceUnavailable();
  }

  return (data ?? []).map(toPublicAddress);
}

export async function insertAddress(
  userId: string,
  input: AddressWriteInput,
): Promise<PublicAddress> {
  const supabase = await createSupabaseServerClient();

  if (input.isDefault) {
    const { error: clearError } = await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .eq("is_default", true);

    if (clearError) {
      logger.warn({ code: clearError.code }, "Address default clear failed");
      throw serviceUnavailable();
    }
  }

  const { data, error } = await supabase
    .from("customer_addresses")
    .insert({
      user_id: userId,
      label: input.label ?? null,
      recipient_name: input.recipientName,
      phone: input.phone,
      address_line: input.addressLine,
      area: input.area,
      notes: input.notes ?? null,
      is_default: input.isDefault ?? false,
    })
    .select(
      "id, label, recipient_name, phone, address_line, area, notes, is_default",
    )
    .single();

  if (error?.code === "23505") {
    throw conflict("A default address already exists.");
  }

  if (error || !data) {
    logger.warn({ code: error?.code }, "Address insert failed");
    throw serviceUnavailable();
  }

  return toPublicAddress(data);
}
