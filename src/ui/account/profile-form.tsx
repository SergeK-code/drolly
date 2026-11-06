"use client";

import { useState, type FormEvent } from "react";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/features/account/hooks";
import { explainApiError } from "@/lib/ui/api";
import { profileWriteSchema } from "@/lib/profile-schema";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { QueryState } from "@/ui/error-retry";
import { Field } from "@/ui/field";
import { Input } from "@/ui/input";
import { useToast } from "@/ui/toast";

export function ProfileForm() {
  const query = useProfileQuery();
  const update = useUpdateProfileMutation();
  const { showToast } = useToast();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const profile = query.data?.profile;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const parsed = validateForm(profileWriteSchema, {
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? "").trim() || null,
    });
    if (!parsed.success) {
      setFieldErrors(parsed.fieldErrors);
      return;
    }

    try {
      await update.mutateAsync(parsed.data);
      showToast("success", "Profile saved.");
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
      pendingMessage="Loading profile…"
      errorMessage="Could not load your profile."
      onRetry={() => void query.refetch()}
    >
      {profile ? (
        <Card>
          <form
            key={`${profile.fullName}:${profile.phone ?? ""}`}
            onSubmit={(event) => void onSubmit(event)}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field id="profile-email" label="Email">
              <Input id="profile-email" value={profile.email} disabled />
            </Field>
            <Field
              id="profile-name"
              label="Full name"
              error={firstFieldError(fieldErrors, "fullName")}
            >
              <Input
                id="profile-name"
                name="fullName"
                defaultValue={profile.fullName}
                autoComplete="name"
              />
            </Field>
            <Field
              id="profile-phone"
              label="Phone"
              error={firstFieldError(fieldErrors, "phone")}
            >
              <Input
                id="profile-phone"
                name="phone"
                defaultValue={profile.phone ?? ""}
                autoComplete="tel"
              />
            </Field>
            <p className="text-xs text-muted">
              Role is {profile.role} and cannot be changed here.
            </p>
            <Button type="submit" disabled={update.isPending} className="w-fit">
              {update.isPending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </Card>
      ) : null}
    </QueryState>
  );
}
