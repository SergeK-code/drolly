import { AuthForm } from "@/features/auth/auth-form";
import { firstQueryValue } from "@/lib/return-to";
import { redirectIfAuthenticated } from "@/server/auth/protect";
import { Card } from "@/ui/card";
import { PageShell } from "@/ui/page-shell";
import { TextLink } from "@/ui/text-link";

export const instant = false;

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string | string[];
    notice?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const returnTo = firstQueryValue(params.returnTo);
  const notice = firstQueryValue(params.notice);
  await redirectIfAuthenticated(returnTo);

  const signUpHref = returnTo
    ? `/sign-up?returnTo=${encodeURIComponent(returnTo)}`
    : "/sign-up";

  return (
    <PageShell className="items-center">
      <Card className="mx-auto w-full max-w-md">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Sign in
        </h1>
        <AuthForm
          key={notice ?? "sign-in"}
          mode="sign-in"
          returnTo={returnTo}
        />
        <p className="mt-4 text-sm text-muted">
          Need an account? <TextLink href={signUpHref}>Sign up</TextLink>
        </p>
      </Card>
    </PageShell>
  );
}
