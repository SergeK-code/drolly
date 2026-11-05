"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { signOutAccount } from "@/features/auth/api";
import { withNotice } from "@/lib/return-to";
import { Button } from "@/ui/button";
import { ConfirmModal } from "@/ui/confirm-modal";
import { useToast } from "@/ui/toast";

export function SignOutButton({
  variant = "button",
}: {
  variant?: "button" | "nav";
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);

    try {
      await signOutAccount();
      queryClient.clear();
      router.push(withNotice("/sign-in", "signed-out"));
      router.refresh();
    } catch (signOutError) {
      showToast(
        "error",
        signOutError instanceof Error
          ? signOutError.message
          : "Could not sign out.",
      );
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        variant={variant === "nav" ? "ghost" : "secondary"}
        size={variant === "nav" ? "sm" : "md"}
        className={variant === "nav" ? "px-2" : "w-fit"}
      >
        Sign out
      </Button>
      <ConfirmModal
        open={open}
        title="Sign out"
        message="Sign out of this account?"
        confirmLabel="Sign out"
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={() => void onConfirm()}
      />
    </>
  );
}
