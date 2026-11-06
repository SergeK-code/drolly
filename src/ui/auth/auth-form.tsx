"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  registerAccount,
  sessionQueryKey,
  signInAccount,
  type PublicUser,
} from "@/features/auth/api";
import { explainApiError } from "@/lib/ui/api";
import { registerSchema, signInSchema } from "@/lib/auth-schemas";
import { resolvePostAuthPath } from "@/lib/return-to";
import {
  firstFieldError,
  validateForm,
  type FieldErrors,
} from "@/lib/zod-fields";
import { Button } from "@/ui/button";
import { Field } from "@/ui/field";
import { Input } from "@/ui/input";
import { useToast } from "@/ui/toast";

type Mode = "sign-in" | "sign-up";

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
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    formRef.current?.reset();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setFieldErrors({});

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      let user: PublicUser | null = null;

      if (mode === "sign-up") {
        const parsed = validateForm(registerSchema, {
          fullName: String(data.get("fullName") ?? ""),
          email,
          password,
        });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          return;
        }

        const result = await registerAccount(parsed.data);

        if (result.confirmationRequired) {
          form.reset();
          showToast(
            "success",
            "Check your email to confirm the account, then sign in.",
          );
          return;
        }

        user = result.user;
      } else {
        const parsed = validateForm(signInSchema, { email, password });
        if (!parsed.success) {
          setFieldErrors(parsed.fieldErrors);
          return;
        }

        const result = await signInAccount(parsed.data);
        user = result.user;
      }

      form.reset();

      if (!user) {
        setFieldErrors({
          password: ["Invalid email or password."],
        });
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
      const explained = explainApiError(submitError);
      setFieldErrors(explained.fieldErrors);
      if (Object.keys(explained.fieldErrors).length === 0) {
        showToast("error", explained.message);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex w-full flex-col gap-4"
      autoComplete="off"
      noValidate
    >
      {mode === "sign-up" ? (
        <Field
          id="fullName"
          label="Full name"
          error={firstFieldError(fieldErrors, "fullName")}
        >
          <Input
            id="fullName"
            name="fullName"
            autoComplete="off"
            disabled={pending}
          />
        </Field>
      ) : null}

      <Field
        id="email"
        label="Email"
        error={firstFieldError(fieldErrors, "email")}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          disabled={pending}
        />
      </Field>

      <Field
        id="password"
        label="Password"
        error={firstFieldError(fieldErrors, "password")}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="off"
          disabled={pending}
        />
      </Field>

      <Button type="submit" disabled={pending}>
        {pending
          ? "Please wait…"
          : mode === "sign-up"
            ? "Create account"
            : "Sign in"}
      </Button>
    </form>
  );
}
