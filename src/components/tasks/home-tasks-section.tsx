"use client";

import { useEffect, useState, useTransition } from "react";

import { useSelectedHome } from "@/components/homes/selected-home-context";
import { NeuSurface } from "@/components/ui/neu-surface";
import type { BackendTaskDto } from "@/lib/api/backend-client";
import { listTasksForHomeAction } from "@/lib/tasks/actions";

export function HomeTasksSection() {
  const { selectedHomeId, selectedHome } = useSelectedHome();
  const [tasks, setTasks] = useState<BackendTaskDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (selectedHomeId == null) {
      setTasks(null);
      setError(null);
      return;
    }
    setError(null);
    setTasks(null);
    startTransition(async () => {
      const result = await listTasksForHomeAction(selectedHomeId);
      if (result.ok) {
        setTasks(result.tasks);
        return;
      }
      setError(result.message);
      setTasks(null);
    });
  }, [selectedHomeId]);

  if (selectedHomeId == null || selectedHome == null) {
    return null;
  }

  const loading = pending || (tasks === null && !error);

  return (
    <NeuSurface variant="raised" className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-[var(--neu-text)]">Tareas</h2>
      <p className="mt-1 text-pretty text-sm text-[var(--neu-text-muted)]">
        Tareas del hogar <span className="font-medium text-[var(--neu-text)]">{selectedHome.name}</span>.
      </p>

      {error ? (
        <p className="mt-4 text-sm text-[var(--neu-text-muted)]" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? <p className="mt-4 text-sm text-[var(--neu-text-muted)]">Cargando tareas…</p> : null}

      {!loading && tasks && tasks.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-4 text-center sm:items-start sm:text-left">
          <p className="text-pretty text-sm text-[var(--neu-text-muted)]">Aún no tienes tareas agregadas.</p>
          <button
            type="button"
            className="neu-focus neu-raised rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99]"
            onClick={() => {
              // TODO: abrir flujo de crear tarea
            }}
          >
            Agregar tarea
          </button>
        </div>
      ) : null}

      {!loading && tasks && tasks.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="neu-inset rounded-[var(--neu-radius-sm)] px-4 py-3 text-sm text-[var(--neu-text)]"
            >
              <span className="font-medium">{t.title}</span>
              <span className="ml-2 text-[var(--neu-text-muted)]">({t.computedStatus})</span>
            </li>
          ))}
        </ul>
      ) : null}
    </NeuSurface>
  );
}
