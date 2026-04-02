"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { useSelectedSpace } from "@/components/spaces/selected-space-context";
import { ROUTES } from "@/lib/routes";

export function ActiveSpaceHeaderBlock() {
  const router = useRouter();
  const { spaces, selectedSpace, setSelectedSpaceId } = useSelectedSpace();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const text = selectedSpace?.name ?? "Sin espacio activo";
  const showSwitcher = spaces.length > 1;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) close();
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

  const pick = (id: string) => {
    setSelectedSpaceId(id);
    close();
    router.push(ROUTES.app);
    router.refresh();
  };

  return (
    <div ref={wrapRef} className="relative flex min-w-0 items-center gap-0.5">
      <Link
        href={ROUTES.app}
        className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-[var(--neu-text)] transition hover:opacity-85 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)]"
        title={`Ir a inicio — ${text}`}
      >
        {text}
      </Link>
      {showSwitcher ? (
        <div className="shrink-0">
          <button
            type="button"
            className="neu-focus rounded-[var(--neu-radius-sm)] p-1.5 text-[var(--neu-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] hover:text-[var(--neu-text)]"
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={open ? menuId : undefined}
            onClick={() => setOpen((o) => !o)}
            title="Cambiar de espacio"
          >
            <ChevronIcon open={open} />
          </button>
          {open ? (
            <div
              id={menuId}
              role="listbox"
              aria-label="Espacios"
              className="neu-raised absolute left-0 top-[calc(100%+0.35rem)] z-50 max-h-[min(60vh,16rem)] w-[min(100vw-2rem,18rem)] max-w-[calc(100vw-2rem)] overflow-auto rounded-[var(--neu-radius-md)] py-1 shadow-[var(--neu-shadow-light),var(--neu-shadow-dark)]"
            >
              <ul className="flex flex-col gap-0.5 p-1">
                {spaces.map((s) => {
                  const isSel = s.id === selectedSpace?.id;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSel}
                        className={`neu-focus w-full rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-left text-sm text-[var(--neu-text)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] ${isSel ? "bg-[color-mix(in_srgb,var(--neu-accent)_12%,transparent)] font-medium" : ""}`}
                        onClick={() => pick(s.id)}
                      >
                        {s.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
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
      className={`transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
