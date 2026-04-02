"use client";

import Link from "next/link";

import { ROUTES } from "@/lib/routes";

/**
 * Enlace explícito a la lista de espacios (visible desde sm+ en la top bar).
 */
export function SpacesNavLink() {
  return (
    <Link
      href={ROUTES.spaces}
      className="neu-focus hidden shrink-0 rounded-[var(--neu-radius-sm)] px-2.5 py-1.5 text-sm font-medium text-[var(--neu-text-muted)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] hover:text-[var(--neu-text)] sm:inline-flex"
    >
      Espacios
    </Link>
  );
}
