"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "@/ui/cx";
import { tapHover } from "@/ui/motion";
import { useSafeReducedMotion } from "@/ui/use-safe-reduced-motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const variantClass: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover",
  secondary:
    "bg-surface text-foreground shadow-sm ring-1 ring-border hover:bg-muted-bg",
  ghost: "bg-transparent text-muted hover:bg-muted-bg hover:text-foreground",
  danger: "bg-danger text-accent-foreground shadow-sm hover:opacity-90",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}): string {
  return cx(
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-150 ease-out",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    "disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "min-h-11 min-w-11 px-3 text-sm" : "min-h-11 min-w-11 px-4 py-2 text-sm",
    variantClass[variant],
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  disabled,
  onClick,
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
}) {
  const reduce = useSafeReducedMotion();
  const motionFeedback = tapHover(reduce);

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={buttonClassName({ variant, size, className })}
      whileHover={motionFeedback.whileHover}
      whileTap={motionFeedback.whileTap}
      transition={motionFeedback.transition}
    >
      {children}
    </motion.button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={buttonClassName({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
