"use client";

import type { ReactNode } from "react";
import { Button } from "@/ui/button";
import { Skeleton } from "@/ui/skeleton";

export function ErrorRetry({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg bg-danger-bg px-4 py-4 ring-1 ring-danger/20">
      <p className="text-sm text-danger">{message}</p>
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
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <p className="sr-only">{pendingMessage}</p>
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-48 rounded-md" />
      </div>
    );
  }

  if (isError) {
    return <ErrorRetry message={errorMessage} onRetry={onRetry} />;
  }

  return children;
}
