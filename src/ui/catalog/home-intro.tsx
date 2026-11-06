"use client";

import { Truck } from "lucide-react";
import { usePublicStoreSettingsQuery } from "@/features/store/hooks";
import { formatMoney } from "@/lib/ui/money";
import { Icon } from "@/ui/icon";
import { Skeleton } from "@/ui/skeleton";

export function HomeIntro() {
  const settingsQuery = usePublicStoreSettingsQuery();
  const settings = settingsQuery.data?.settings;

  return (
    <section className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
      <div className="rounded-md bg-surface px-5 py-6 ring-1 ring-border sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-accent">
          Cash on delivery
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Order from the catalog. Pay when it arrives.
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-6 text-muted">
          Search by name, pick a category, add to cart. We recalculate price,
          stock and delivery on the server at checkout.
        </p>
      </div>
      <aside className="flex flex-col justify-center gap-3 rounded-md bg-muted-bg px-5 py-5 ring-1 ring-border">
        {settingsQuery.isPending ? (
          <Skeleton className="h-6 w-40" />
        ) : settings ? (
          <p className="flex items-center gap-2 text-sm">
            <Icon icon={Truck} />
            Delivery {formatMoney(settings.deliveryFeeMinor, settings.currency)}
          </p>
        ) : (
          <p className="text-sm text-muted">
            Delivery fee is confirmed at checkout.
          </p>
        )}
      </aside>
    </section>
  );
}
