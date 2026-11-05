"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/ui/button";
import { fadeSlide, motionTransition, overlayFade } from "@/ui/motion";
import { useSafeReducedMotion } from "@/ui/use-safe-reduced-motion";

export function Modal({
  open,
  title,
  closeButton = false,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  closeButton?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const reduce = useSafeReducedMotion();
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!isClient) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          role="presentation"
          {...overlayFade}
          transition={motionTransition(reduce)}
        >
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-foreground/40"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-5 shadow-md"
            {...fadeSlide}
            transition={motionTransition(reduce)}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2
                id="modal-title"
                className="text-lg font-semibold tracking-tight"
              >
                {title}
              </h2>
              {closeButton ? (
                <Button variant="ghost" onClick={onClose} aria-label="Close">
                  Close
                </Button>
              ) : null}
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function subscribeToClient(): () => void {
  return () => {};
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}
