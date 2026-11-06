import "server-only";

import { conflict, notFound, serviceUnavailable } from "@/server/http/api";
import { logger } from "@/server/logging/logger";
import { toPublicAddress, type PublicAddress } from "@/server/orders/public";
import type { AddressWriteInput } from "@/server/orders/schemas";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

const ADDRESS_SELECT =
  "id, label, recipient_name, phone, address_line, area, notes, is_default";

export async function listAddresses(userId: string): Promise<PublicAddress[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .select(ADDRESS_SELECT)
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
      is_default: false,
    })
    .select(ADDRESS_SELECT)
    .single();

  if (error?.code === "23505") {
    throw conflict("A default address already exists.");
  }

  if (error || !data) {
    logger.warn({ code: error?.code }, "Address insert failed");
    throw serviceUnavailable();
  }

  if (input.isDefault) {
    await syncDefaultAddress(data.id);
    return { ...toPublicAddress(data), isDefault: true };
  }

  return toPublicAddress(data);
}

export async function updateAddress(
  userId: string,
  addressId: string,
  input: AddressWriteInput,
): Promise<PublicAddress> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .update({
      label: input.label ?? null,
      recipient_name: input.recipientName,
      phone: input.phone,
      address_line: input.addressLine,
      area: input.area,
      notes: input.notes ?? null,
      is_default: false,
    })
    .eq("id", addressId)
    .eq("user_id", userId)
    .select(ADDRESS_SELECT)
    .maybeSingle();

  if (error?.code === "23505") {
    throw conflict("A default address already exists.");
  }

  if (error) {
    logger.warn({ code: error.code }, "Address update failed");
    throw serviceUnavailable();
  }

  if (!data) {
    throw notFound("Address not found.");
  }

  if (input.isDefault) {
    await syncDefaultAddress(addressId);
    return { ...toPublicAddress(data), isDefault: true };
  }

  return toPublicAddress(data);
}

export async function deleteAddress(
  userId: string,
  addressId: string,
): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    logger.warn({ code: error.code }, "Address delete failed");
    throw serviceUnavailable();
  }

  if (!data) {
    throw notFound("Address not found.");
  }
}

async function syncDefaultAddress(addressId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("sync_default_customer_address", {
    p_address_id: addressId,
  });

  if (!error) {
    return;
  }

  const code = error.message?.match(/ADDRESS_[A-Z]+/)?.[0];
  if (code === "ADDRESS_NOT_FOUND") {
    throw notFound("Address not found.");
  }

  logger.warn({ code: error.code }, "Default address sync failed");
  throw serviceUnavailable();
}
