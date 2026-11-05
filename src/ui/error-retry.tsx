"use client";

import type { ReactNode } from "react";
import { Button } from "@/ui/button";

export function ErrorRetry({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-base text-danger">{message}</p>
      <Button variant="secondary" onClick={onRetry} className="w-fit">
        Retry
      </Button>
    </div>
  );
}

export function QueryState({
  isPending,
  isError,
  pendingMessage = "Loading…",
  errorMessage,
  onRetry,
  children,
}: {
  isPending: boolean;
  isError: boolean;
  pendingMessage?: string;
  errorMessage: string;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (isPending) {
    return <p className="text-sm text-muted">{pendingMessage}</p>;
  }

  if (isError) {
    return <ErrorRetry message={errorMessage} onRetry={onRetry} />;
  }

  return children;
}
