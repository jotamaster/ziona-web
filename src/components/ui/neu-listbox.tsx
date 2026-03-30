"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export type NeuListboxOption<T extends string> = {
  value: T;
  label: string;
};

type NeuListboxProps<T extends string> = {
  id?: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly NeuListboxOption<T>[];
  disabled?: boolean;
  className?: string;
};

export function NeuListbox<T extends string>({
  id,
  value,
  onChange,
  options,
  disabled,
  className,
}: NeuListboxProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className={className ? `relative ${className}` : "relative"}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        className="neu-inset flex w-full items-center justify-between gap-2 rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-left text-base text-[var(--neu-text)] outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)] disabled:opacity-60"
      >
        <span className="min-w-0 truncate">{selectedLabel}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="neu-raised absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(40vh,12rem)] overflow-auto rounded-[var(--neu-radius-md)] py-1 shadow-[var(--neu-shadow-light),var(--neu-shadow-dark)]"
        >
          {options.map((opt) => {
            const isSel = opt.value === value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  className={`neu-focus flex w-full items-center justify-between gap-2 rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-left text-sm text-[var(--neu-text)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] ${isSel ? "bg-[color-mix(in_srgb,var(--neu-accent)_12%,transparent)] font-medium" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    close();
                  }}
                >
                  <span>{opt.label}</span>
                  {isSel ? <CheckIcon /> : <span className="w-[18px] shrink-0" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 text-[var(--neu-text-muted)] transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-[var(--neu-accent)]"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}
