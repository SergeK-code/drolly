"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { AdminCategory, AdminProduct } from "@/features/admin-catalog/api";
import { AdminApiError } from "@/features/admin-catalog/api";
import { fieldError } from "@/features/admin-catalog/field-error";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/features/admin-catalog/hooks";
import { catalogImageUrl } from "@/lib/catalog-media";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";
import { Input, Select, Textarea } from "@/ui/input";
import { MediaImage } from "@/ui/media-image";
import { useToast } from "@/ui/toast";

export function ProductForm({
  product,
  categories,
  onSaved,
}: {
  product?: AdminProduct;
  categories: AdminCategory[];
  onSaved?: () => void;
}) {
  const { showToast } = useToast();
  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation(product?.id ?? "");
  const pending = createMutation.isPending || updateMutation.isPending;
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const input = {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? "").trim() || null,
      categoryId: String(form.get("categoryId") ?? ""),
      priceMinor: Number(form.get("priceMinor") ?? 0),
      currency: String(form.get("currency") ?? "USD"),
      stockQuantity: Number(form.get("stockQuantity") ?? 0),
    };

    try {
      if (product) {
        await updateMutation.mutateAsync(input);
        showToast("success", "Product saved.");
      } else {
        await createMutation.mutateAsync(input);
        showToast("success", "Product created.");
      }
      onSaved?.();
    } catch (submitError) {
      showToast(
        "error",
        submitError instanceof Error
          ? submitError.message
          : "The request failed.",
      );
      if (submitError instanceof AdminApiError && submitError.fieldErrors) {
        setFieldErrors(submitError.fieldErrors);
      }
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4">
      <Field id="product-name" label="Name" error={fieldError(fieldErrors, "name")}>
        <Input
          id="product-name"
          name="name"
          defaultValue={product?.name}
          required
        />
      </Field>
      <Field
        id="product-category"
        label="Category"
        error={fieldError(fieldErrors, "categoryId")}
      >
        <Select
          id="product-category"
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? ""}
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
              {category.isActive ? "" : " (archived)"}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        id="product-description"
        label="Description"
        error={fieldError(fieldErrors, "description")}
      >
        <Textarea
          id="product-description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
        />
      </Field>
      <Field
        id="product-price"
        label="Price (minor units)"
        error={fieldError(fieldErrors, "priceMinor")}
      >
        <Input
          id="product-price"
          name="priceMinor"
          type="number"
          defaultValue={String(product?.priceMinor ?? 0)}
          required
          min={0}
        />
      </Field>
      <Field
        id="product-currency"
        label="Currency"
        error={fieldError(fieldErrors, "currency")}
      >
        <Input
          id="product-currency"
          name="currency"
          defaultValue={product?.currency ?? "USD"}
          required
        />
      </Field>
      <Field id="product-image" label="Image">
        <Input
          id="product-image"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setImagePreview((current) => {
              if (current) {
                URL.revokeObjectURL(current);
              }
              return file ? URL.createObjectURL(file) : null;
            });
          }}
        />
        <p className="text-xs text-muted">
          Preview only. The image is not uploaded yet.
        </p>
        {imagePreview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagePreview}
              alt="Selected product"
              className="mt-1 h-32 w-32 rounded-md object-cover"
            />
          </>
        ) : (
          <div className="mt-1 h-32 w-32 overflow-hidden rounded-md">
            <MediaImage
              src={catalogImageUrl(product?.slug ?? "new-product")}
              alt="Product"
              className="h-32 w-32"
            />
          </div>
        )}
      </Field>
      <Field
        id="product-stock"
        label="Stock"
        error={fieldError(fieldErrors, "stockQuantity")}
      >
        <Input
          id="product-stock"
          name="stockQuantity"
          type="number"
          defaultValue={String(product?.stockQuantity ?? 0)}
          required
          min={0}
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : product ? "Save product" : "Create product"}
      </Button>
    </form>
  );
}
