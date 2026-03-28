"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createHomeAction, type CreateHomeState } from "@/lib/homes/actions";

type CreateHomeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateHomeDialog({ open, onOpenChange }: CreateHomeDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result: CreateHomeState = await createHomeAction(name);
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
      <div
        className="neu-raised fixed left-1/2 top-1/2 z-[80] w-[min(100%,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--neu-radius-lg)] p-6 shadow-[var(--neu-shadow-light),var(--neu-shadow-dark)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="text-lg font-semibold text-[var(--neu-text)]">
          Nuevo hogar
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-[var(--neu-text-muted)]">
              Nombre
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="text"
              name="name"
              autoComplete="off"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi hogar"
              className="neu-inset w-full rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-base text-[var(--neu-text)] outline-none placeholder:text-[var(--neu-text-muted)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)]"
              disabled={pending}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-err` : undefined}
            />
            {error ? (
              <p id={`${inputId}-err`} className="mt-2 text-sm text-[var(--neu-text-muted)]" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="neu-focus neu-inset rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-medium text-[var(--neu-text)] transition active:scale-[0.99]"
              onClick={close}
              disabled={pending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="neu-focus neu-raised rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99] disabled:opacity-60"
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "Creando…" : "Crear hogar"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
