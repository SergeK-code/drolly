import { AuthForm } from "@/features/auth/auth-form";
import { firstQueryValue, signInHref } from "@/lib/return-to";
import { redirectIfAuthenticated } from "@/server/auth/protect";
import { Card } from "@/ui/card";
import { PageShell } from "@/ui/page-shell";
import { TextLink } from "@/ui/text-link";

export const instant = false;

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const returnTo = firstQueryValue((await searchParams).returnTo);
  await redirectIfAuthenticated(returnTo);

  const signInLink = returnTo ? signInHref(returnTo) : "/sign-in";

  return (
    <PageShell className="items-center">
      <Card className="mx-auto w-full max-w-md">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Create account
        </h1>
        <AuthForm mode="sign-up" returnTo={returnTo} />
        <p className="mt-4 text-sm text-muted">
          Already registered? <TextLink href={signInLink}>Sign in</TextLink>
        </p>
      </Card>
    </PageShell>
  );
}
