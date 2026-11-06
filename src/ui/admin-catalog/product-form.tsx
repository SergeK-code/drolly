"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { AdminCategory, AdminProduct } from "@/features/admin-catalog/api";
import { uploadAdminImage } from "@/features/admin-catalog/api";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/features/admin-catalog/hooks";
import { explainApiError } from "@/lib/ui/api";
import { adminProductWriteSchema } from "@/lib/admin-catalog-schemas";
import { catalogImageUrl } from "@/lib/ui/catalog-media";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
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
  const [uploading, setUploading] = useState(false);
  const pending =
    createMutation.isPending || updateMutation.isPending || uploading;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(
    product?.imagePath ?? null,
  );

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
    const parsed = validateForm(adminProductWriteSchema, {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? "").trim() || null,
      categoryId: String(form.get("categoryId") ?? ""),
      priceMinor: form.get("priceMinor"),
      currency: String(form.get("currency") ?? "USD"),
      stockQuantity: form.get("stockQuantity"),
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    try {
      const fileInput = event.currentTarget.elements.namedItem("image");
      const file =
        fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : undefined;
      let nextImagePath = imagePath;
      if (file) {
        setUploading(true);
        const uploaded = await uploadAdminImage(file, "products");
        nextImagePath = uploaded.path;
        setImagePath(uploaded.path);
      }

      const payload = { ...parsed.data, imagePath: nextImagePath };
      if (product) {
        await updateMutation.mutateAsync(payload);
        showToast("success", "Product saved.");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("success", "Product created.");
      }
      onSaved?.();
    } catch (submitError) {
      const explained = explainApiError(submitError);
      setFieldErrors(explained.fieldErrors);
      if (Object.keys(explained.fieldErrors).length === 0) {
        showToast("error", explained.message);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4" noValidate>
      <Field
        id="product-name"
        label="Name"
        error={firstFieldError(fieldErrors, "name")}
      >
        <Input id="product-name" name="name" defaultValue={product?.name} />
      </Field>
      <Field
        id="product-category"
        label="Category"
        error={firstFieldError(fieldErrors, "categoryId")}
      >
        <Select
          id="product-category"
          name="categoryId"
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
        error={firstFieldError(fieldErrors, "description")}
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
        error={firstFieldError(fieldErrors, "priceMinor")}
      >
        <Input
          id="product-price"
          name="priceMinor"
          type="number"
          defaultValue={String(product?.priceMinor ?? 0)}
          min={0}
        />
      </Field>
      <Field
        id="product-currency"
        label="Currency"
        error={firstFieldError(fieldErrors, "currency")}
      >
        <Input
          id="product-currency"
          name="currency"
          defaultValue={product?.currency ?? "USD"}
        />
      </Field>
      <Field
        id="product-image"
        label="Image"
        error={firstFieldError(fieldErrors, "file")}
      >
        <Input
          id="product-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
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
          JPG, PNG or WebP, up to 2 MB. The file is uploaded when you save.
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
              src={catalogImageUrl(
                product?.slug ?? "new-product",
                imagePath,
              )}
              alt="Product"
              zoom={false}
              className="h-32 w-32"
            />
          </div>
        )}
      </Field>
      <Field
        id="product-stock"
        label="Stock"
        error={firstFieldError(fieldErrors, "stockQuantity")}
      >
        <Input
          id="product-stock"
          name="stockQuantity"
          type="number"
          defaultValue={String(product?.stockQuantity ?? 0)}
          min={0}
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : product ? "Save product" : "Create product"}
      </Button>
    </form>
  );
}
