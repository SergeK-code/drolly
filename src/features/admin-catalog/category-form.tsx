"use client";

import { useState, type FormEvent } from "react";
import type { AdminCategory } from "@/features/admin-catalog/api";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/admin-catalog/hooks";
import { explainApiError } from "@/lib/api";
import { adminCategoryWriteSchema } from "@/lib/admin-catalog-schemas";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";
import { Input, Textarea } from "@/ui/input";
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
  const pending = createMutation.isPending || updateMutation.isPending;
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
      if (category) {
        await updateMutation.mutateAsync(parsed.data);
        showToast("success", "Category saved.");
      } else {
        await createMutation.mutateAsync(parsed.data);
        showToast("success", "Category created.");
      }
      onSaved?.();
    } catch (submitError) {
      const explained = explainApiError(submitError);
      setFieldErrors(explained.fieldErrors);
      if (Object.keys(explained.fieldErrors).length === 0) {
        showToast("error", explained.message);
      }
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
