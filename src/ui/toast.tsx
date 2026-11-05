"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fadeSlide, motionTransition } from "@/ui/motion";
import { cx } from "@/ui/cx";
import { useSafeReducedMotion } from "@/ui/use-safe-reduced-motion";

type ToastTone = "success" | "error";

type ToastItem = {
  id: number;
  tone: ToastTone;
  message: string;
};

type ToastContextValue = {
  showToast: (tone: ToastTone, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastSeq = 0;
const NOTICE_STORAGE_KEY = "drolly.notice";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const reduce = useSafeReducedMotion();

  const showToast = useCallback((tone: ToastTone, message: string) => {
    const id = ++toastSeq;
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      <NoticeFlash showToast={showToast} />
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.p
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className={cx(
                "pointer-events-auto w-full max-w-sm rounded-md px-4 py-3 text-sm shadow-md ring-1 ring-border",
                toast.tone === "success"
                  ? "bg-surface text-success"
                  : "bg-surface text-danger",
              )}
              {...fadeSlide}
              transition={motionTransition(reduce)}
            >
              {toast.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return context;
}

const NOTICE_TOASTS: Record<string, { tone: ToastTone; message: string }> = {
  "signin-required": {
    tone: "error",
    message: "Please sign in to open that page.",
  },
  "admin-only": {
    tone: "error",
    message: "You do not have access to the admin area.",
  },
  "signed-out": {
    tone: "success",
    message: "You signed out.",
  },
};

function NoticeFlash({
  showToast,
}: {
  showToast: ToastContextValue["showToast"];
}) {
  const didShow = useRef(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get("notice");

    if (fromUrl) {
      sessionStorage.setItem(NOTICE_STORAGE_KEY, fromUrl);
      url.searchParams.delete("notice");
      const query = url.searchParams.toString();
      window.history.replaceState(
        null,
        "",
        `${url.pathname}${query ? `?${query}` : ""}${url.hash}`,
      );
    }

    const notice = sessionStorage.getItem(NOTICE_STORAGE_KEY);
    if (!notice || didShow.current) {
      return;
    }

    const toast = NOTICE_TOASTS[notice];
    if (!toast) {
      sessionStorage.removeItem(NOTICE_STORAGE_KEY);
      return;
    }

    didShow.current = true;
    showToast(toast.tone, toast.message);
    window.setTimeout(() => {
      sessionStorage.removeItem(NOTICE_STORAGE_KEY);
    }, 2000);
  }, [showToast]);

  return null;
}
