import { getCurrentUser } from "@/server/auth/protect";
import { Card } from "@/ui/card";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <Card>
      <p className="text-base text-muted">
        Signed in as {user.fullName || user.email} ({user.role}).
      </p>
    </Card>
  );
}
