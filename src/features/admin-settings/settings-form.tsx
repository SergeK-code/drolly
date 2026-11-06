"use client";

import { useState, type FormEvent } from "react";
import {
  useAdminStoreSettingsQuery,
  useUpdateStoreSettingsMutation,
} from "@/features/store/hooks";
import { explainApiError } from "@/lib/api";
import { storeSettingsWriteSchema } from "@/lib/store-settings-schema";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { AdminPanel } from "@/features/admin/admin-panel";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { QueryState } from "@/ui/error-retry";
import { Field } from "@/ui/field";
import { Input } from "@/ui/input";
import { useToast } from "@/ui/toast";

export function StoreSettingsForm() {
  const query = useAdminStoreSettingsQuery();
  const update = useUpdateStoreSettingsMutation();
  const { showToast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const settings = query.data?.settings;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    if (!settings) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const parsed = validateForm(storeSettingsWriteSchema, {
      storeName: String(form.get("storeName") ?? ""),
      contactPhone: String(form.get("contactPhone") ?? "").trim() || null,
      contactEmail: String(form.get("contactEmail") ?? "").trim() || null,
      currency: String(form.get("currency") ?? ""),
      deliveryFeeMinor: form.get("deliveryFeeMinor"),
      minimumOrderMinor: settings.minimumOrderMinor,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    try {
      await update.mutateAsync(parsed.data);
      showToast("success", "Store settings saved.");
    } catch (error) {
      const explained = explainApiError(error);
      setFieldErrors(explained.fieldErrors);
      if (Object.keys(explained.fieldErrors).length === 0) {
        showToast("error", explained.message);
      }
    }
  }

  return (
    <AdminPanel
      title="Store settings"
      description="Checkout reads delivery fee and currency from the database, not from the browser. Keep currency the same as your products or checkout will reject mixed-currency carts."
    >
      <QueryState
        isPending={query.isPending}
        isError={query.isError}
        pendingMessage="Loading settings…"
        errorMessage="Could not load store settings."
        onRetry={() => void query.refetch()}
      >
        {settings ? (
          <Card>
            <form
              key={settings.storeName}
              onSubmit={(event) => void onSubmit(event)}
              className="flex max-w-lg flex-col gap-4"
              noValidate
            >
              <Field
                id="store-name"
                label="Store name"
                error={firstFieldError(fieldErrors, "storeName")}
              >
                <Input
                  id="store-name"
                  name="storeName"
                  defaultValue={settings.storeName}
                />
              </Field>
              <Field
                id="store-phone"
                label="Contact phone"
                error={firstFieldError(fieldErrors, "contactPhone")}
              >
                <Input
                  id="store-phone"
                  name="contactPhone"
                  defaultValue={settings.contactPhone ?? ""}
                />
              </Field>
              <Field
                id="store-email"
                label="Contact email"
                error={firstFieldError(fieldErrors, "contactEmail")}
              >
                <Input
                  id="store-email"
                  name="contactEmail"
                  type="email"
                  defaultValue={settings.contactEmail ?? ""}
                />
              </Field>
              <Field
                id="store-currency"
                label="Currency"
                error={firstFieldError(fieldErrors, "currency")}
              >
                <Input
                  id="store-currency"
                  name="currency"
                  defaultValue={settings.currency}
                />
              </Field>
              <p className="-mt-2 text-xs text-muted">
                Must match the currency on your products.
              </p>
              <Field
                id="store-fee"
                label="Delivery fee (minor units)"
                error={firstFieldError(fieldErrors, "deliveryFeeMinor")}
              >
                <Input
                  id="store-fee"
                  name="deliveryFeeMinor"
                  type="number"
                  min={0}
                  defaultValue={String(settings.deliveryFeeMinor)}
                />
              </Field>
              <Button type="submit" disabled={update.isPending} className="w-fit">
                {update.isPending ? "Saving…" : "Save settings"}
              </Button>
            </form>
          </Card>
        ) : null}
      </QueryState>
    </AdminPanel>
  );
}
