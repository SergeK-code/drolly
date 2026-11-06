import "server-only";

import { notFound, serviceUnavailable } from "@/server/http/api";
import { logger } from "@/server/logging/logger";
import type { StoreSettingsWrite } from "@/lib/store-settings-schema";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

export type PublicStoreSettings = {
  storeName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  currency: string;
  deliveryFeeMinor: number;
  minimumOrderMinor: number;
};

export type DashboardSummary = {
  categoryCount: number;
  productCount: number;
  orderCount: number;
  pendingOrderCount: number;
};

function toPublicSettings(row: {
  store_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  currency: string;
  delivery_fee_minor: number;
  minimum_order_minor: number;
}): PublicStoreSettings {
  return {
    storeName: row.store_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    currency: row.currency,
    deliveryFeeMinor: row.delivery_fee_minor,
    minimumOrderMinor: row.minimum_order_minor,
  };
}

export async function getStoreSettings(): Promise<PublicStoreSettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      "store_name, contact_phone, contact_email, currency, delivery_fee_minor, minimum_order_minor",
    )
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    logger.warn({ code: error.code }, "Store settings lookup failed");
    throw serviceUnavailable();
  }

  if (!data) {
    throw notFound("Store settings were not found.");
  }

  return toPublicSettings(data);
}

export async function updateStoreSettings(
  input: StoreSettingsWrite,
): Promise<PublicStoreSettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("store_settings")
    .update({
      store_name: input.storeName,
      contact_phone: input.contactPhone,
      contact_email: input.contactEmail,
      currency: input.currency,
      delivery_fee_minor: input.deliveryFeeMinor,
      minimum_order_minor: input.minimumOrderMinor,
    })
    .eq("id", 1)
    .select(
      "store_name, contact_phone, contact_email, currency, delivery_fee_minor, minimum_order_minor",
    )
    .maybeSingle();

  if (error) {
    logger.warn({ code: error.code }, "Store settings update failed");
    throw serviceUnavailable();
  }

  if (!data) {
    throw notFound("Store settings were not found.");
  }

  return toPublicSettings(data);
}

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function countRows(
  supabase: ServerClient,
  table: "categories" | "products" | "orders",
): Promise<number> {
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });

  if (error) {
    logger.warn({ code: error.code, table }, "Dashboard count failed");
    throw serviceUnavailable();
  }

  return count ?? 0;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createSupabaseServerClient();
  const [pendingResult, categoryCount, productCount, orderCount] =
    await Promise.all([
      supabase
        .from("order_statuses")
        .select("id")
        .eq("code", "pending")
        .maybeSingle(),
      countRows(supabase, "categories"),
      countRows(supabase, "products"),
      countRows(supabase, "orders"),
    ]);

  if (pendingResult.error) {
    logger.warn(
      { code: pendingResult.error.code },
      "Pending status lookup failed",
    );
    throw serviceUnavailable();
  }

  let pendingOrderCount = 0;
  if (pendingResult.data) {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status_id", pendingResult.data.id);

    if (error) {
      logger.warn({ code: error.code }, "Pending order count failed");
      throw serviceUnavailable();
    }

    pendingOrderCount = count ?? 0;
  }

  return {
    categoryCount,
    productCount,
    orderCount,
    pendingOrderCount,
  };
}
