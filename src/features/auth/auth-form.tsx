"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  registerAccount,
  sessionQueryKey,
  signInAccount,
  type PublicUser,
} from "@/features/auth/api";
import { ApiError } from "@/lib/api";
import { resolvePostAuthPath } from "@/lib/return-to";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";
import { Input } from "@/ui/input";
import { useToast } from "@/ui/toast";

type Mode = "sign-in" | "sign-up";

type FieldErrors = Record<string, string[] | undefined>;

export function AuthForm({
  mode,
  returnTo,
}: {
  mode: Mode;
  returnTo?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      let user: PublicUser | null = null;

      if (mode === "sign-up") {
        const fullName = String(form.get("fullName") ?? "");
        const result = await registerAccount({ fullName, email, password });

        if (result.confirmationRequired) {
          showToast(
            "success",
            "Check your email to confirm the account, then sign in.",
          );
          setPending(false);
          return;
        }

        user = result.user;
      } else {
        const result = await signInAccount({ email, password });
        user = result.user;
      }

      if (!user) {
        showToast("error", "Sign in to continue.");
        return;
      }

      await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      showToast(
        "success",
        mode === "sign-up" ? "Your account is ready." : "Welcome back.",
      );
      router.push(resolvePostAuthPath(returnTo, user.role));
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "The request failed.";
      showToast("error", message);
      if (submitError instanceof ApiError && submitError.fieldErrors) {
        setFieldErrors(submitError.fieldErrors);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-4" noValidate>
      {mode === "sign-up" ? (
        <Field
          id="fullName"
          label="Full name"
          error={fieldErrors.fullName?.[0]}
        >
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            required
            disabled={pending}
          />
        </Field>
      ) : null}

      <Field id="email" label="Email" error={fieldErrors.email?.[0]}>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
      </Field>

      <Field id="password" label="Password" error={fieldErrors.password?.[0]}>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          required
          minLength={mode === "sign-up" ? 8 : undefined}
          disabled={pending}
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending ? "Please wait…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
