"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/ui/cx";
import { controlClassName } from "@/ui/input";
import { overlayFade, motionTransition } from "@/lib/ui/motion";
import { useSafeReducedMotion } from "@/ui/use-safe-reduced-motion";

export type DropdownOption<T extends string = string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

export function Dropdown<T extends string>({
  id,
  value,
  options,
  onChange,
  placeholder = "Select",
  disabled = false,
  className,
  menuClassName,
  align = "start",
  "aria-label": ariaLabel,
}: {
  id?: string;
  value?: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  align?: "start" | "end";
  "aria-label"?: string;
}) {
  const reduce = useSafeReducedMotion();
  const generatedId = useId();
  const rootId = id ?? generatedId;
  const listId = `${rootId}-list`;
  const isClient = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const selectedIndex = options.findIndex((option) => option.value === value);
  const [highlight, setHighlight] = useState(Math.max(selectedIndex, 0));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function onScroll() {
      setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    listRef.current?.focus();
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  function placeMenu() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const menuHeight = Math.min(options.length * 40, 256);
    const opensUp = rect.bottom + 4 + menuHeight > window.innerHeight;
    setMenuPos({
      top: opensUp ? Math.max(8, rect.top - menuHeight - 4) : rect.bottom + 4,
      left: align === "end" ? rect.right - rect.width : rect.left,
      width: rect.width,
    });
  }

  function openMenu() {
    if (disabled) {
      return;
    }

    placeMenu();
    setHighlight(Math.max(selectedIndex, 0));
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  function toggle() {
    if (open) {
      close();
      return;
    }

    openMenu();
  }

  function choose(option: DropdownOption<T>) {
    if (option.disabled) {
      return;
    }

    onChange(option.value);
    close();
  }

  function moveHighlight(direction: 1 | -1) {
    if (options.length === 0) {
      return;
    }

    let next = highlight;
    for (let step = 0; step < options.length; step += 1) {
      next = (next + direction + options.length) % options.length;
      if (!options[next]?.disabled) {
        setHighlight(next);
        return;
      }
    }
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMenu();
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveHighlight(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveHighlight(-1);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      setHighlight(0);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      setHighlight(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[highlight];
      if (option) {
        choose(option);
      }
    }
  }

  const highlighted = options[highlight];
  const menu =
    open && isClient
      ? createPortal(
          <AnimatePresence>
            <motion.ul
              id={listId}
              role="listbox"
              ref={listRef}
              tabIndex={-1}
              aria-labelledby={rootId}
              aria-activedescendant={
                highlighted ? `${rootId}-option-${highlighted.value}` : undefined
              }
              onKeyDown={onListKeyDown}
              style={{
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
              }}
              className={cx(
                "fixed z-[60] max-h-64 overflow-y-auto rounded-md bg-surface py-1 shadow-md ring-1 ring-border",
                menuClassName,
              )}
              {...overlayFade}
              transition={motionTransition(reduce)}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === highlight;

                return (
                  <li
                    key={option.value}
                    id={`${rootId}-option-${option.value}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    className={cx(
                      "cursor-pointer px-3 py-2 text-sm",
                      option.disabled && "cursor-not-allowed text-muted opacity-60",
                      isActive && !option.disabled && "bg-accent-subtle",
                      isSelected && "font-medium text-accent",
                    )}
                    onMouseEnter={() => setHighlight(index)}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      choose(option);
                    }}
                    onClick={() => choose(option)}
                  >
                    {option.label}
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <div className={cx("relative", className)}>
      <button
        id={rootId}
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
        className={cx(
          controlClassName,
          "inline-flex items-center justify-between gap-2 text-left",
        )}
      >
        <span className={cx(!selected && "text-muted")}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown className={cx("shrink-0 text-muted", open && "rotate-180")} />
      </button>
      {menu}
    </div>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cx("h-4 w-4 transition-transform", className)}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
