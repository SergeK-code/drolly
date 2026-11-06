import type { Transition } from "framer-motion";

export const motionDuration = {
  fast: 0.18,
  med: 0.24,
} as const;

export const fadeSlide = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const overlayFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export function motionTransition(reduce: boolean | null): Transition {
  if (reduce) {
    return { duration: 0 };
  }

  return { duration: motionDuration.med, ease: "easeOut" as const };
}

export function tapHover(reduce: boolean | null) {
  if (reduce) {
    return {
      whileHover: undefined,
      whileTap: undefined,
      transition: { duration: 0 as const },
    };
  }

  return {
    whileHover: { y: -1 },
    whileTap: { scale: 0.98 },
    transition: { duration: motionDuration.fast, ease: "easeOut" as const },
  };
}
