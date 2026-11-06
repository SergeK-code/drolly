"use client";

import { useState, type FormEvent } from "react";
import {
  useDeleteAddressMutation,
  useUpdateAddressMutation,
} from "@/features/account/hooks";
import { useAddressesQuery, useCreateAddressMutation } from "@/features/orders/hooks";
import type { PublicAddress } from "@/features/orders/api";
import { explainApiError } from "@/lib/api";
import { addressWriteSchema } from "@/lib/checkout-schema";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { ConfirmModal } from "@/ui/confirm-modal";
import { QueryState } from "@/ui/error-retry";
import { Field } from "@/ui/field";
import { Input, Textarea } from "@/ui/input";
import { useToast } from "@/ui/toast";

type Draft = {
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  area: string;
  notes: string;
  isDefault: boolean;
};

const emptyDraft = (): Draft => ({
  label: "",
  recipientName: "",
  phone: "",
  addressLine: "",
  area: "",
  notes: "",
  isDefault: false,
});

function draftFromAddress(address: PublicAddress): Draft {
  return {
    label: address.label ?? "",
    recipientName: address.recipientName,
    phone: address.phone,
    addressLine: address.addressLine,
    area: address.area,
    notes: address.notes ?? "",
    isDefault: address.isDefault,
  };
}

export function AddressBook() {
  const query = useAddressesQuery();
  const create = useCreateAddressMutation();
  const update = useUpdateAddressMutation();
  const remove = useDeleteAddressMutation();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addresses = query.data?.addresses ?? [];
  const pending = create.isPending || update.isPending;

  function startNew() {
    setEditingId("new");
    setDraft(emptyDraft());
    setFieldErrors({});
  }

  function startEdit(address: PublicAddress) {
    setEditingId(address.id);
    setDraft(draftFromAddress(address));
    setFieldErrors({});
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});

    const parsed = validateForm(addressWriteSchema, {
      label: draft.label.trim() ? draft.label : null,
      recipientName: draft.recipientName,
      phone: draft.phone,
      addressLine: draft.addressLine,
      area: draft.area,
      notes: draft.notes.trim() ? draft.notes : null,
      isDefault: draft.isDefault,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    try {
      if (editingId === "new") {
        await create.mutateAsync(parsed.data);
        showToast("success", "Address saved.");
      } else if (editingId) {
        await update.mutateAsync({ id: editingId, input: parsed.data });
        showToast("success", "Address updated.");
      }
      setEditingId(null);
      setDraft(emptyDraft());
    } catch (error) {
      const explained = explainApiError(error);
      setFieldErrors(explained.fieldErrors);
      if (Object.keys(explained.fieldErrors).length === 0) {
        showToast("error", explained.message);
      }
    }
  }

  return (
    <QueryState
      isPending={query.isPending}
      isError={query.isError}
      pendingMessage="Loading addresses…"
      errorMessage="Could not load addresses."
      onRetry={() => void query.refetch()}
    >
      <div className="flex flex-col gap-4">
        {addresses.length === 0 && editingId !== "new" ? (
          <p className="text-sm text-muted">No saved addresses yet.</p>
        ) : null}
        {addresses.map((address) => (
          <Card key={address.id}>
            {editingId === address.id ? (
              <AddressFields
                draft={draft}
                setDraft={setDraft}
                fieldErrors={fieldErrors}
                pending={pending}
                onSubmit={onSubmit}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-col gap-2">
                <p className="font-medium">
                  {address.label ? `${address.label} — ` : ""}
                  {address.recipientName}
                  {address.isDefault ? " (default)" : ""}
                </p>
                <p className="text-sm text-muted">
                  {address.addressLine}, {address.area}
                </p>
                <p className="text-sm text-muted">{address.phone}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => startEdit(address)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteId(address.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
        {editingId === "new" ? (
          <Card>
            <AddressFields
              draft={draft}
              setDraft={setDraft}
              fieldErrors={fieldErrors}
              pending={pending}
              onSubmit={onSubmit}
              onCancel={() => setEditingId(null)}
            />
          </Card>
        ) : (
          <Button type="button" className="w-fit" onClick={startNew}>
            Add address
          </Button>
        )}
      </div>
      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete address"
        message="Remove this saved address?"
        confirmLabel="Delete"
        pending={remove.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!deleteId) {
            return;
          }
          void remove
            .mutateAsync(deleteId)
            .then(() => {
              showToast("success", "Address deleted.");
              setDeleteId(null);
            })
            .catch((error: unknown) => {
              showToast("error", explainApiError(error).message);
            });
        }}
      />
    </QueryState>
  );
}

function AddressFields({
  draft,
  setDraft,
  fieldErrors,
  pending,
  onSubmit,
  onCancel,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  fieldErrors: FieldErrors;
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}) {
  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft({ ...draft, [key]: value });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <Field id="addr-label" label="Label" error={firstFieldError(fieldErrors, "label")}>
        <Input
          id="addr-label"
          value={draft.label}
          onChange={(event) => set("label", event.target.value)}
        />
      </Field>
      <Field
        id="addr-recipient"
        label="Recipient"
        error={firstFieldError(fieldErrors, "recipientName")}
      >
        <Input
          id="addr-recipient"
          value={draft.recipientName}
          onChange={(event) => set("recipientName", event.target.value)}
        />
      </Field>
      <Field id="addr-phone" label="Phone" error={firstFieldError(fieldErrors, "phone")}>
        <Input
          id="addr-phone"
          value={draft.phone}
          onChange={(event) => set("phone", event.target.value)}
        />
      </Field>
      <Field
        id="addr-line"
        label="Address"
        error={firstFieldError(fieldErrors, "addressLine")}
      >
        <Input
          id="addr-line"
          value={draft.addressLine}
          onChange={(event) => set("addressLine", event.target.value)}
        />
      </Field>
      <Field id="addr-area" label="Area" error={firstFieldError(fieldErrors, "area")}>
        <Input
          id="addr-area"
          value={draft.area}
          onChange={(event) => set("area", event.target.value)}
        />
      </Field>
      <Field id="addr-notes" label="Notes" error={firstFieldError(fieldErrors, "notes")}>
        <Textarea
          id="addr-notes"
          value={draft.notes}
          onChange={(event) => set("notes", event.target.value)}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={draft.isDefault}
          onChange={(event) => set("isDefault", event.target.checked)}
        />
        Default address
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save address"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
