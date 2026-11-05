"use client";

import { useState, type FormEvent } from "react";
import type { AdminCategory } from "@/features/admin-catalog/api";
import { AdminApiError } from "@/features/admin-catalog/api";
import { fieldError } from "@/features/admin-catalog/field-error";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/features/admin-catalog/hooks";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const input = {
      name: String(form.get("name") ?? ""),
      description: String(form.get("description") ?? "").trim() || null,
      sortOrder: Number(form.get("sortOrder") ?? 0),
    };

    try {
      if (category) {
        await updateMutation.mutateAsync(input);
        showToast("success", "Category saved.");
      } else {
        await createMutation.mutateAsync(input);
        showToast("success", "Category created.");
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
      <Field
        id="category-name"
        label="Name"
        error={fieldError(fieldErrors, "name")}
      >
        <Input
          id="category-name"
          name="name"
          defaultValue={category?.name}
          required
        />
      </Field>
      <Field
        id="category-description"
        label="Description"
        error={fieldError(fieldErrors, "description")}
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
        error={fieldError(fieldErrors, "sortOrder")}
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
