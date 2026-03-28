import Link from "next/link";

import type { Home } from "@/lib/homes/types";
import { ROUTES } from "@/lib/routes";

type ActiveHomeTitleProps = {
  activeHome: Home | null;
  emptyLabel?: string;
};

export function ActiveHomeTitle({
  activeHome,
  emptyLabel = "Sin hogar activo",
}: ActiveHomeTitleProps) {
  const text = activeHome?.name ?? emptyLabel;

  return (
    <Link
      href={ROUTES.homes}
      className="min-w-0 truncate text-base font-semibold tracking-tight text-[var(--neu-text)] transition hover:opacity-85 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)]"
      title={`Ir a hogares — ${text}`}
    >
      {text}
    </Link>
  );
}
