"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";

import type { BackendHomeMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import { createTaskAction, updateTaskAction } from "@/lib/tasks/actions";

import { NeuListbox } from "@/components/ui/neu-listbox";

import { datetimeLocalToIso, isoToDatetimeLocalValue } from "./task-utils";

const PRIORITY_OPTIONS = [
  { value: "low" as const, label: "Baja" },
  { value: "medium" as const, label: "Media" },
  { value: "high" as const, label: "Alta" },
];

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  homeId: string;
  mode: "create" | "edit";
  task?: BackendTaskDto | null;
  members: BackendHomeMemberDto[];
  onSuccess?: () => void;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  homeId,
  mode,
  task,
  members,
  onSuccess,
}: TaskFormDialogProps) {
  const titleId = useId();
  const titleFieldId = useId();
  const descId = useId();
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueLocal, setDueLocal] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setDueLocal(isoToDatetimeLocalValue(task.dueDate));
      setAssigneeIds(new Set());
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueLocal("");
      setAssigneeIds(new Set());
    }
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 0);
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
  }, [open, onOpenChange, mode, task]);

  if (!open) return null;

  const close = () => onOpenChange(false);

  const toggleAssignee = (userId: string) => {
    setAssigneeIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("El título no puede estar vacío.");
      return;
    }

    startTransition(async () => {
      if (mode === "create") {
        const dueIso = datetimeLocalToIso(dueLocal);
        const result = await createTaskAction(homeId, {
          title: trimmedTitle,
          ...(description.trim() ? { description: description.trim() } : {}),
          priority,
          ...(dueIso ? { dueDate: dueIso } : {}),
          ...(assigneeIds.size > 0 ? { assigneeUserIds: [...assigneeIds] } : {}),
        });
        if (result.ok) {
          close();
          onSuccess?.();
          return;
        }
        setError(result.message);
        return;
      }

      if (mode === "edit" && task) {
        const descTrim = description.trim();
        const duePatch =
          dueLocal.trim() === "" ? null : (datetimeLocalToIso(dueLocal) ?? null);
        const result = await updateTaskAction(homeId, task.id, {
          title: trimmedTitle,
          description: descTrim.length ? descTrim : null,
          priority,
          dueDate: duePatch,
        });
        if (result.ok) {
          close();
          onSuccess?.();
          return;
        }
        setError(result.message);
      }
    });
  };

  const heading = mode === "create" ? "Nueva tarea" : "Editar tarea";
  const submitLabel =
    mode === "create" ? (pending ? "Creando…" : "Crear tarea") : pending ? "Guardando…" : "Guardar";

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
          className="neu-raised pointer-events-auto max-h-[min(90vh,calc(100vh-2rem))] w-[min(100%,26rem)] overflow-y-auto rounded-[var(--neu-radius-lg)] p-6 shadow-[var(--neu-shadow-light),var(--neu-shadow-dark)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
        <h2 id={titleId} className="text-lg font-semibold text-[var(--neu-text)]">
          {heading}
        </h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label htmlFor={titleFieldId} className="mb-1.5 block text-sm font-medium text-[var(--neu-text-muted)]">
              Título
            </label>
            <input
              ref={firstInputRef}
              id={titleFieldId}
              type="text"
              name="title"
              autoComplete="off"
              maxLength={500}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="neu-inset w-full rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-base text-[var(--neu-text)] outline-none placeholder:text-[var(--neu-text-muted)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)]"
              disabled={pending}
            />
          </div>
          <div>
            <label htmlFor={descId} className="mb-1.5 block text-sm font-medium text-[var(--neu-text-muted)]">
              Descripción
            </label>
            <textarea
              id={descId}
              name="description"
              rows={3}
              maxLength={20000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="neu-inset w-full resize-y rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-base text-[var(--neu-text)] outline-none placeholder:text-[var(--neu-text-muted)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)]"
              disabled={pending}
            />
          </div>
          <div>
            <label htmlFor={`${titleId}-prio`} className="mb-1.5 block text-sm font-medium text-[var(--neu-text-muted)]">
              Prioridad
            </label>
            <NeuListbox
              id={`${titleId}-prio`}
              value={priority}
              onChange={setPriority}
              options={PRIORITY_OPTIONS}
              disabled={pending}
            />
          </div>
          <div>
            <label htmlFor={`${titleId}-due`} className="mb-1.5 block text-sm font-medium text-[var(--neu-text-muted)]">
              Fecha límite
            </label>
            <input
              id={`${titleId}-due`}
              type="datetime-local"
              value={dueLocal}
              onChange={(e) => setDueLocal(e.target.value)}
              className="neu-inset w-full rounded-[var(--neu-radius-sm)] px-3 py-2.5 text-base text-[var(--neu-text)] outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--neu-accent)_45%,transparent)]"
              disabled={pending}
            />
            <p className="mt-1 text-xs text-[var(--neu-text-muted)]">Opcional. Deja vacío para quitar la fecha.</p>
          </div>

          {mode === "create" && members.length > 0 ? (
            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-sm font-medium text-[var(--neu-text-muted)]">Asignar a</legend>
              <div className="neu-inset max-h-40 space-y-2 overflow-y-auto rounded-[var(--neu-radius-sm)] p-3">
                {members.map((m) => (
                  <label key={m.userId} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--neu-text)]">
                    <input
                      type="checkbox"
                      checked={assigneeIds.has(m.userId)}
                      onChange={() => toggleAssignee(m.userId)}
                      disabled={pending}
                      className="h-4 w-4 rounded border-[var(--neu-text-muted)]"
                    />
                    <span className="min-w-0 truncate">{m.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {error ? (
            <p className="text-sm text-[var(--neu-text-muted)]" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
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
              {submitLabel}
            </button>
          </div>
        </form>
        </div>
      </div>
    </>
  );
}
