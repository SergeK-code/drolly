import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Drolly</h1>
      <p className="max-w-prose text-base leading-7 text-zinc-600 dark:text-zinc-400">
        Catalog, cart, checkout and admin tools will be added in later phases.
        The browser talks only to this app&apos;s API routes; Supabase stays on
        the server.
      </p>
      <nav className="flex flex-wrap gap-4 text-sm font-medium">
        <Link className="underline underline-offset-2" href="/sign-in">
          Sign in
        </Link>
        <Link className="underline underline-offset-2" href="/sign-up">
          Create account
        </Link>
      </nav>
    </main>
  );
}
