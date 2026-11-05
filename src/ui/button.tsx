"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cx } from "@/ui/cx";
import { tapHover } from "@/ui/motion";
import { useSafeReducedMotion } from "@/ui/use-safe-reduced-motion";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "sm";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover",
  secondary:
    "bg-surface text-foreground shadow-sm ring-1 ring-border hover:bg-background",
  ghost: "bg-transparent text-foreground hover:bg-surface",
  danger: "bg-danger text-white shadow-sm",
};

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
      className={cx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60",
        size === "sm"
          ? "min-h-9 min-w-9 px-3 text-xs"
          : "min-h-11 min-w-11 px-4 py-2 text-sm",
        variantClass[variant],
        className,
      )}
      whileHover={motionFeedback.whileHover}
      whileTap={motionFeedback.whileTap}
      transition={motionFeedback.transition}
    >
      {children}
    </motion.button>
  );
}
