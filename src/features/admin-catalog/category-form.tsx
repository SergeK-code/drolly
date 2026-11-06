"use client";

import { useState, type FormEvent } from "react";
import { uploadAdminImage, type AdminCategory } from "@/features/admin-catalog/api";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/admin-catalog/hooks";
import { explainApiError } from "@/lib/api";
import { adminCategoryWriteSchema } from "@/lib/admin-catalog-schemas";
import { catalogImageUrl } from "@/lib/catalog-media";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";
import { Input, Textarea } from "@/ui/input";
import { MediaImage } from "@/ui/media-image";
import { useToast } from "@/ui/toast";

export function CategoryForm({
  category,
  onSaved,
}: {
  category?: AdminCategory;
  onSaved?: () => void;
}) {
  const { showToast } = useToast();
  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation(category?.id ?? "");
  const [uploading, setUploading] = useState(false);
  const pending =
    createMutation.isPending || updateMutation.isPending || uploading;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [imagePath, setImagePath] = useState<string | null>(
    category?.imagePath ?? null,
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const parsed = validateForm(adminCategoryWriteSchema, {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? "").trim() || null,
      sortOrder: form.get("sortOrder"),
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
        const uploaded = await uploadAdminImage(file, "categories");
        nextImagePath = uploaded.path;
        setImagePath(uploaded.path);
      }

      const payload = { ...parsed.data, imagePath: nextImagePath };
      if (category) {
        await updateMutation.mutateAsync(payload);
        showToast("success", "Category saved.");
      } else {
        await createMutation.mutateAsync(payload);
        showToast("success", "Category created.");
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
        id="category-name"
        label="Name"
        error={firstFieldError(fieldErrors, "name")}
      >
        <Input
          id="category-name"
          name="name"
          defaultValue={category?.name}
        />
      </Field>
      <Field
        id="category-description"
        label="Description"
        error={firstFieldError(fieldErrors, "description")}
      >
        <Textarea
          id="category-description"
          name="description"
          rows={3}
          defaultValue={category?.description ?? ""}
        />
      </Field>
      <Field
        id="category-image"
        label="Image"
        error={firstFieldError(fieldErrors, "file")}
      >
        <Input
          id="category-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
        />
        <p className="text-xs text-muted">
          JPG, PNG or WebP, up to 2 MB. The file is uploaded when you save.
        </p>
        <div className="mt-1 h-24 w-24 overflow-hidden rounded-md">
          <MediaImage
            src={catalogImageUrl(category?.slug ?? "new-category", imagePath)}
            alt=""
            className="h-24 w-24"
          />
        </div>
      </Field>
      <Field
        id="category-sort"
        label="Sort order"
        error={firstFieldError(fieldErrors, "sortOrder")}
      >
        <Input
          id="category-sort"
          name="sortOrder"
          type="number"
          defaultValue={String(category?.sortOrder ?? 0)}
        />
      </Field>
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : category ? "Save category" : "Create category"}
      </Button>
    </form>
  );
}
