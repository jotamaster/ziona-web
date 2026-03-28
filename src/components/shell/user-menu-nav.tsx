"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import { ThemeSelect } from "@/components/theme/theme-select";
import { ROUTES } from "@/lib/routes";

type UserMenuNavProps = {
  onNavigate?: () => void;
};

const rowClass =
  "neu-focus flex min-h-[44px] w-full items-center rounded-[var(--neu-radius-sm)] px-3 text-left text-base font-medium text-[var(--neu-text)] transition hover:bg-[color-mix(in_srgb,var(--neu-text)_6%,transparent)] active:scale-[0.99]";

export function UserMenuNav({ onNavigate }: UserMenuNavProps) {
  const close = () => onNavigate?.();

  return (
    <nav className="flex flex-col gap-1 pt-2" aria-label="Cuenta">
      <Link href={ROUTES.homes} className={rowClass} onClick={close}>
        Hogares
      </Link>
      <Link href={ROUTES.invitations} className={rowClass} onClick={close}>
        Invitaciones
      </Link>
      <ThemeSelect />
      <button
        type="button"
        className={`${rowClass} mt-1 border-t border-[color-mix(in_srgb,var(--neu-text)_8%,transparent)] pt-3 text-[var(--neu-accent)]`}
        onClick={() => {
          close();
          void signOut({ callbackUrl: ROUTES.login });
        }}
      >
        Salir
      </button>
    </nav>
  );
}
