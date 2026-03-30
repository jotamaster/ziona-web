"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteHomeAction, type DeleteHomeState } from "@/lib/homes/actions";
import type { Home } from "@/lib/homes/types";

type DeleteHomeDialogProps = {
  home: Home;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si es el hogar mostrado como activo en la lista (primer ítem), se muestra aviso extra. */
  isActive?: boolean;
};

export function DeleteHomeDialog({ home, open, onOpenChange, isActive = false }: DeleteHomeDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const close = () => onOpenChange(false);

  const confirm = () => {
    setError(null);
    startTransition(async () => {
      const result: DeleteHomeState = await deleteHomeAction(home.id);
      if (result.ok) {
        close();
        router.refresh();
        return;
      }
      setError(result.message);
    });
  };

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[70] cursor-default bg-[color-mix(in_srgb,var(--neu-text)_18%,transparent)] backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={close}
      />
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="neu-raised pointer-events-auto w-[min(100%,22rem)] rounded-[var(--neu-radius-lg)] p-6 shadow-[var(--neu-shadow-light),var(--neu-shadow-dark)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
        >
        <h2 id={titleId} className="text-lg font-semibold text-[var(--neu-text)]">
          ¿Eliminar hogar?
        </h2>
        <p id={descId} className="mt-2 text-pretty text-sm text-[var(--neu-text-muted)]">
          Se eliminará <span className="font-medium text-[var(--neu-text)]">{home.name}</span>. Esta acción no se
          puede deshacer.
        </p>
        {isActive ? (
          <p className="mt-3 text-pretty text-sm text-[var(--neu-text-muted)]">
            Es el hogar que aparece como activo en la barra superior. El siguiente hogar de la lista pasará a
            mostrarse como activo.
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 text-sm text-[var(--neu-text-muted)]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            className="neu-focus neu-inset rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-medium text-[var(--neu-text)] transition active:scale-[0.99]"
            onClick={close}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="neu-focus rounded-[var(--neu-radius-sm)] bg-[color-mix(in_srgb,red_12%,var(--neu-bg))] px-4 py-2.5 text-sm font-semibold text-red-800 transition hover:brightness-[1.02] active:scale-[0.99] dark:text-red-200"
            onClick={confirm}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
