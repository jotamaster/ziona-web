"use client";

import { useState } from "react";

import type { Space } from "@/lib/spaces/types";

import { DeleteSpaceDialog } from "./delete-space-dialog";

type SpaceDeleteButtonProps = {
  space: Space;
  isActive: boolean;
};

export function SpaceDeleteButton({ space, isActive }: SpaceDeleteButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="neu-focus rounded-[var(--neu-radius-sm)] px-3 py-1.5 text-sm font-medium text-[var(--neu-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] hover:text-[var(--neu-text)] active:scale-[0.99]"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Eliminar
      </button>
      <DeleteSpaceDialog space={space} isActive={isActive} open={open} onOpenChange={setOpen} />
    </>
  );
}
