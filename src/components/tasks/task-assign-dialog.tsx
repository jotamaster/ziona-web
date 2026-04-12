"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { BackendSpaceMemberDto } from "@/lib/api/backend-client";
import type { BackendTaskDto } from "@/lib/api/backend-client";
import { assignTaskUsersAction } from "@/lib/tasks/actions";

type TaskAssignDialogProps = {
  spaceId: string;
  task: BackendTaskDto;
  members: BackendSpaceMemberDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskAssignDialog({ spaceId, task, members, open, onOpenChange }: TaskAssignDialogProps) {
  const router = useRouter();
  const titleId = useId();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  const assignedIds = new Set(task.assignees.map((a) => a.userId));
  const available = members.filter((m) => !assignedIds.has(m.userId));

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelected(new Set());
    const t = window.setTimeout(() => firstFocusRef.current?.focus(), 0);
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

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const submit = () => {
    if (selected.size === 0) {
      setError("Selecciona al menos una persona.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await assignTaskUsersAction(spaceId, task.id, [...selected]);
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
          className="neu-raised pointer-events-auto max-h-[min(80vh,28rem)] w-[min(100%,24rem)] overflow-y-auto rounded-[var(--neu-radius-lg)] p-6 shadow-[var(--neu-shadow-light),var(--neu-shadow-dark)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
        <h2 id={titleId} className="text-lg font-semibold text-[var(--neu-text)]">
          Asignar personas
        </h2>
        {available.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--neu-text-muted)]">Todos los miembros ya están asignados.</p>
        ) : (
          <ul className="neu-inset mt-4 max-h-48 space-y-2 overflow-y-auto rounded-[var(--neu-radius-sm)] p-3">
            {available.map((m) => (
              <li key={m.userId}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--neu-text)]">
                  <input
                    type="checkbox"
                    checked={selected.has(m.userId)}
                    onChange={() => toggle(m.userId)}
                    disabled={pending}
                    className="h-4 w-4 rounded"
                  />
                  <span className="min-w-0 truncate">{m.name}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {error ? (
          <p className="mt-3 text-sm text-[var(--neu-text-muted)]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={firstFocusRef}
            type="button"
            className="neu-focus neu-inset rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-medium text-[var(--neu-text)] transition active:scale-[0.99]"
            onClick={close}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="neu-focus neu-raised rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99] disabled:opacity-60"
            onClick={submit}
            disabled={pending || available.length === 0}
            aria-busy={pending}
          >
            {pending ? "Asignando…" : "Asignar"}
          </button>
        </div>
        </div>
      </div>
    </>
  );
}
