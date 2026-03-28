"use client";

import { useEffect, useRef } from "react";

import { UserMenuCopyPublicCode } from "@/components/shell/user-menu-copy-public-code";
import { UserMenuHeader } from "@/components/shell/user-menu-header";
import { UserMenuNav } from "@/components/shell/user-menu-nav";
import type { ShellUser } from "@/components/shell/types";

type UserMenuPanelProps = {
  open: boolean;
  onClose: () => void;
  panelId: string;
  user: ShellUser;
};

export function UserMenuPanel({ open, onClose, panelId, user }: UserMenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const focusable = panelRef.current.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-50 cursor-default bg-[color-mix(in_srgb,var(--neu-text)_18%,transparent)] backdrop-blur-[2px]"
        aria-label="Cerrar menú"
        onClick={onClose}
      />
      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de usuario"
        tabIndex={-1}
        className="neu-raised fixed right-0 top-0 z-[60] flex h-full w-[min(100%,20rem)] flex-col gap-0 overflow-y-auto rounded-l-[var(--neu-radius-lg)] p-5 shadow-[var(--neu-shadow-light),var(--neu-shadow-dark)]"
      >
        <UserMenuHeader name={user.name} email={user.email} imageUrl={user.imageUrl} onClose={onClose} />
        <UserMenuCopyPublicCode publicCode={user.publicCode} />
        <UserMenuNav onNavigate={onClose} />
      </div>
    </>
  );
}
