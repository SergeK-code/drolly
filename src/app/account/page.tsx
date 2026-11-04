import { getCurrentUser } from "@/server/auth/current-user";
import { SignOutButton } from "@/features/auth/sign-out-button";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Your account</h1>
      <p className="text-base text-zinc-600 dark:text-zinc-400">
        Signed in as {user.fullName || user.email} ({user.role}).
      </p>
      <SignOutButton />
    </main>
  );
}
