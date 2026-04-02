"use client";

import { useState } from "react";

import { CreateSpaceDialog } from "./create-space-dialog";

type CreateSpaceButtonProps = {
  variant?: "primary" | "inline";
  label: string;
  className?: string;
};

export function CreateSpaceButton({ variant = "primary", label, className = "" }: CreateSpaceButtonProps) {
  const [open, setOpen] = useState(false);

  const base =
    variant === "primary"
      ? "neu-focus neu-raised w-full max-w-sm rounded-[var(--neu-radius-md)] px-6 py-3.5 text-center text-base font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99]"
      : "neu-focus neu-raised shrink-0 rounded-[var(--neu-radius-sm)] px-4 py-2 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99]";

  return (
    <>
      <button
        type="button"
        className={`${base} ${className}`.trim()}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>
      <CreateSpaceDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
