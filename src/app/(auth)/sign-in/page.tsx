import { AuthForm } from "@/ui/auth/auth-form";
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
        <h1 className="mb-1 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mb-6 text-sm text-muted">
          Use your account email and password.
        </p>
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
