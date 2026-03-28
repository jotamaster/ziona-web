"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { id: "system" as const, label: "Sistema" },
  { id: "light" as const, label: "Claro" },
  { id: "dark" as const, label: "Oscuro" },
];

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-1 border-t border-[color-mix(in_srgb,var(--neu-text)_8%,transparent)] pt-3">
        <p className="mb-2 px-3 text-sm font-medium text-[var(--neu-text-muted)]">Apariencia</p>
        <div
          className="h-11 rounded-[var(--neu-radius-sm)] neu-inset"
          aria-hidden
        />
      </div>
    );
  }

  const active = theme ?? "system";

  return (
    <div className="mt-1 border-t border-[color-mix(in_srgb,var(--neu-text)_8%,transparent)] pt-3">
      <p className="mb-2 px-3 text-sm font-medium text-[var(--neu-text-muted)]">Apariencia</p>
      <div
        className="flex gap-1 rounded-[var(--neu-radius-sm)] neu-inset p-1"
        role="group"
        aria-label="Tema de la aplicación"
      >
        {OPTIONS.map((opt) => {
          const isActive = active === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={
                isActive
                  ? "neu-focus neu-raised flex min-h-[40px] flex-1 items-center justify-center rounded-[calc(var(--neu-radius-sm)-4px)] px-1 text-center text-xs font-semibold text-[var(--neu-text)] sm:text-sm"
                  : "neu-focus flex min-h-[40px] flex-1 items-center justify-center rounded-[calc(var(--neu-radius-sm)-4px)] px-1 text-center text-xs font-medium text-[var(--neu-text-muted)] transition hover:text-[var(--neu-text)] active:scale-[0.99] sm:text-sm"
              }
              aria-pressed={isActive}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
