"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useSession } from "@/features/auth/hooks";
import { useCart } from "@/features/cart/cart-store";
import { fetchProduct } from "@/features/catalog/api";
import { catalogQueryKey } from "@/features/catalog/query-keys";
import {
  useAddressesQuery,
  useCheckoutMutation,
  useCreateAddressMutation,
} from "@/features/orders/hooks";
import { formatMoney } from "@/features/orders/money";
import { ApiError, explainApiError } from "@/lib/api";
import {
  addressWriteSchema,
  checkoutAddressSchema,
  checkoutBodySchema,
} from "@/lib/checkout-schema";
import { signInHref } from "@/lib/return-to";
import {
  firstFieldError,
  messageFromFieldErrors,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { Field } from "@/ui/field";
import { Input, Select, Textarea } from "@/ui/input";
import { QueryState } from "@/ui/error-retry";
import { TextLink } from "@/ui/text-link";
import { useToast } from "@/ui/toast";

const IDEMPOTENCY_STORAGE_KEY = "drolly-checkout-idempotency";
const ADDRESS_FIELDS = [
  "recipientName",
  "phone",
  "addressLine",
  "area",
  "notes",
  "addressId",
];

function checkoutIdempotencyKey(): string {
  if (typeof window === "undefined") {
    return crypto.randomUUID();
  }

  const existing = window.sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const next = crypto.randomUUID();
  window.sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, next);
  return next;
}

function bannerFromFieldErrors(fieldErrors: FieldErrors): string | null {
  const leftover: FieldErrors = {};

  for (const [key, messages] of Object.entries(fieldErrors)) {
    const leaf = key.includes(".") ? (key.split(".").at(-1) ?? key) : key;
    if (!ADDRESS_FIELDS.includes(leaf)) {
      leftover[key] = messages;
    }
  }

  return Object.keys(leftover).length > 0
    ? messageFromFieldErrors(leftover)
    : null;
}

export function CheckoutForm() {
  const router = useRouter();
  const session = useSession();
  const items = useCart((state) => state.items);
  const clearCart = useCart((state) => state.clear);
  const addressesQuery = useAddressesQuery();
  const checkout = useCheckoutMutation();
  const saveAddress = useCreateAddressMutation();
  const { showToast } = useToast();
  const productQueries = useQueries({
    queries: items.map((item) => ({
      queryKey: catalogQueryKey.product(item.productId),
      queryFn: () => fetchProduct(item.productId),
      retry: false,
    })),
  });

  const [addressId, setAddressId] = useState("");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const lines = useMemo(
    () =>
      items.map((item, index) => {
        const live = productQueries[index]?.data?.product;
        return {
          productId: item.productId,
          quantity: item.quantity,
          name: live?.name ?? item.snapshot.name,
          priceMinor: live?.priceMinor ?? item.snapshot.priceMinor,
          currency: live?.currency ?? item.snapshot.currency,
        };
      }),
    [items, productQueries],
  );

  const user = session.data?.user ?? null;
  const addresses = addressesQuery.data?.addresses ?? [];
  const usingSaved = addressId.length > 0;

  if (session.isPending) {
    return <p className="text-sm text-muted">Checking session…</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-muted">
        <TextLink href={signInHref("/checkout")}>Sign in</TextLink> to place an
        order.
      </p>
    );
  }

  if (user.role !== "customer") {
    return (
      <p className="text-sm text-muted">
        Checkout is available on customer accounts.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted">
        Your cart is empty. <TextLink href="/">Browse products</TextLink>
      </p>
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);

    const payloadItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));
    const idempotencyKey = checkoutIdempotencyKey();

    try {
      let checkoutAddressId = addressId || undefined;

      if (!checkoutAddressId) {
        const addressParsed = validateForm(checkoutAddressSchema, {
          recipientName,
          phone,
          addressLine,
          area,
          notes: notes.trim() ? notes : null,
        });
        if (!addressParsed.success) {
          setFieldErrors(addressParsed.fieldErrors);
          return;
        }

        if (saveNewAddress) {
          const writeParsed = validateForm(addressWriteSchema, addressParsed.data);
          if (!writeParsed.success) {
            setFieldErrors(writeParsed.fieldErrors);
            return;
          }
          const saved = await saveAddress.mutateAsync(writeParsed.data);
          checkoutAddressId = saved.address.id;
        } else {
          const bodyParsed = validateForm(checkoutBodySchema, {
            idempotencyKey,
            items: payloadItems,
            address: addressParsed.data,
          });
          if (!bodyParsed.success) {
            setFieldErrors(bodyParsed.fieldErrors);
            setFormError(bannerFromFieldErrors(bodyParsed.fieldErrors));
            return;
          }

          const result = await checkout.mutateAsync(bodyParsed.data);
          window.sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
          clearCart();
          showToast("success", "Order placed. Pay cash on delivery.");
          router.replace(`/account/orders/${result.order.id}`);
          return;
        }
      }

      const bodyParsed = validateForm(checkoutBodySchema, {
        idempotencyKey,
        items: payloadItems,
        addressId: checkoutAddressId,
      });
      if (!bodyParsed.success) {
        setFieldErrors(bodyParsed.fieldErrors);
        setFormError(bannerFromFieldErrors(bodyParsed.fieldErrors));
        return;
      }

      const result = await checkout.mutateAsync(bodyParsed.data);
      window.sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
      clearCart();
      showToast("success", "Order placed. Pay cash on delivery.");
      router.replace(`/account/orders/${result.order.id}`);
    } catch (error) {
      const explained = explainApiError(error);
      setFieldErrors(explained.fieldErrors);
      setFormError(
        bannerFromFieldErrors(explained.fieldErrors) ??
          (Object.keys(explained.fieldErrors).length > 0
            ? null
            : explained.message),
      );
      if (
        !(error instanceof ApiError) ||
        error.code !== "VALIDATION_ERROR"
      ) {
        showToast("error", explained.message);
      }
    }
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="flex flex-col gap-6"
      noValidate
    >
      <Card>
        <h2 className="mb-3 text-lg font-semibold">Items</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-3">
              <span>
                {line.name} × {line.quantity}
              </span>
              <span>
                {formatMoney(line.priceMinor * line.quantity, line.currency)}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Prices, stock and delivery fee are calculated on the server. Payment is
          cash on delivery.
        </p>
      </Card>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Delivery address</h2>
        <QueryState
          isPending={addressesQuery.isPending}
          isError={addressesQuery.isError}
          pendingMessage="Loading addresses…"
          errorMessage="Could not load saved addresses."
          onRetry={() => void addressesQuery.refetch()}
        >
          {addresses.length > 0 ? (
            <Field
              id="saved-address"
              label="Saved address"
              error={firstFieldError(fieldErrors, "addressId")}
            >
              <Select
                id="saved-address"
                value={addressId}
                onChange={(event) => {
                  setAddressId(event.target.value);
                  setFieldErrors({});
                }}
              >
                <option value="">Enter a new address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {(address.label ? `${address.label} — ` : "") +
                      address.addressLine}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
        </QueryState>

        {usingSaved ? null : (
          <div className="mt-4 flex flex-col gap-3">
            <Field
              id="recipientName"
              label="Recipient"
              error={firstFieldError(fieldErrors, "recipientName")}
            >
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(event) => setRecipientName(event.target.value)}
                autoComplete="name"
              />
            </Field>
            <Field
              id="phone"
              label="Phone"
              error={firstFieldError(fieldErrors, "phone")}
            >
              <Input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
            </Field>
            <Field
              id="addressLine"
              label="Address"
              error={firstFieldError(fieldErrors, "addressLine")}
            >
              <Input
                id="addressLine"
                value={addressLine}
                onChange={(event) => setAddressLine(event.target.value)}
                autoComplete="street-address"
              />
            </Field>
            <Field
              id="area"
              label="Area"
              error={firstFieldError(fieldErrors, "area")}
            >
              <Input
                id="area"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                autoComplete="address-level2"
              />
            </Field>
            <Field
              id="notes"
              label="Delivery notes"
              error={firstFieldError(fieldErrors, "notes")}
            >
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={saveNewAddress}
                onChange={(event) => setSaveNewAddress(event.target.checked)}
              />
              Save this address
            </label>
          </div>
        )}
      </Card>

      {formError ? (
        <p className="text-sm text-danger" role="alert">
          {formError}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={checkout.isPending || saveAddress.isPending}
      >
        {checkout.isPending ? "Placing order…" : "Place cash-on-delivery order"}
      </Button>
    </form>
  );
}
