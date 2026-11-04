"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutAccount } from "@/features/auth/api";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);

    try {
      await signOutAccount();
      router.push("/sign-in");
      router.refresh();
    } catch (signOutError) {
      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Could not sign out.",
      );
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="w-fit rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900 disabled:opacity-60 dark:border-zinc-700 dark:focus:outline-zinc-100"
      >
        {pending ? "Signing out…" : "Sign out"}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
