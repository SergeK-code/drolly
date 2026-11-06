import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { cx } from "@/lib/ui/cx";

export const controlClassName =
  "min-h-11 w-full rounded-md border-0 bg-surface px-3 py-2 text-base text-foreground shadow-sm ring-1 ring-border placeholder:text-muted aria-[invalid=true]:ring-danger aria-[invalid=true]:ring-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent disabled:opacity-50";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(controlClassName, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(controlClassName, "min-h-24", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx(controlClassName, className)} {...props} />;
}
