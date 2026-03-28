"use client";

import { useEffect } from "react";

import { NeuSurface } from "@/components/ui/neu-surface";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <NeuSurface variant="raised" className="p-6 sm:p-8">
      <h1 className="text-lg font-semibold text-[var(--neu-text)]">Algo salió mal</h1>
      <p className="mt-2 text-pretty text-sm text-[var(--neu-text-muted)]">
        No pudimos cargar esta sección. Comprueba tu conexión e inténtalo de nuevo.
      </p>
      <button
        type="button"
        className="neu-focus neu-raised mt-6 rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99]"
        onClick={() => reset()}
      >
        Reintentar
      </button>
    </NeuSurface>
  );
}
