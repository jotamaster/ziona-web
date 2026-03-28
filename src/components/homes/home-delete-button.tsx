"use client";

import { useState } from "react";

import type { Home } from "@/lib/homes/types";

import { DeleteHomeDialog } from "./delete-home-dialog";

type HomeDeleteButtonProps = {
  home: Home;
};

export function HomeDeleteButton({ home }: HomeDeleteButtonProps) {
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
      <DeleteHomeDialog home={home} open={open} onOpenChange={setOpen} />
    </>
  );
}
