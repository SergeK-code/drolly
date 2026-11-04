"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { registerAccount, signInAccount } from "@/features/auth/api";

type Mode = "sign-in" | "sign-up";

type FieldErrors = Record<string, string[] | undefined>;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "sign-up") {
        const fullName = String(form.get("fullName") ?? "");
        const result = await registerAccount({ fullName, email, password });

        if (result.confirmationRequired) {
          setSuccess("Check your email to confirm the account, then sign in.");
          setPending(false);
          return;
        }
      } else {
        await signInAccount({ email, password });
      }

      router.push("/account");
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "The request failed.";
      setError(message);
      if (submitError && typeof submitError === "object" && "fieldErrors" in submitError) {
        setFieldErrors(
          (submitError as { fieldErrors?: FieldErrors }).fieldErrors ?? {},
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-4" noValidate>
      {mode === "sign-up" ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            autoComplete="name"
            required
            disabled={pending}
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:outline-zinc-100"
          />
          {fieldErrors.fullName ? (
            <p className="text-sm text-red-700 dark:text-red-400">
              {fieldErrors.fullName[0]}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:outline-zinc-100"
        />
        {fieldErrors.email ? (
          <p className="text-sm text-red-700 dark:text-red-400">
            {fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          required
          minLength={mode === "sign-up" ? 8 : undefined}
          disabled={pending}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:outline-zinc-100"
        />
        {fieldErrors.password ? (
          <p className="text-sm text-red-700 dark:text-red-400">
            {fieldErrors.password[0]}
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-green-800 dark:text-green-400">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:focus:outline-zinc-100"
      >
        {pending ? "Please wait…" : mode === "sign-up" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
