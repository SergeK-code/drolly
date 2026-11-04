import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <AuthForm mode="sign-in" />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Need an account?{" "}
        <Link className="underline underline-offset-2" href="/sign-up">
          Sign up
        </Link>
      </p>
    </main>
  );
}
