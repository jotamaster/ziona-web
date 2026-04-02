"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { BackendSpaceMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import type { BackendTaskEventDto } from "@/lib/api/backend-client";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { NeuSurface } from "@/components/ui/neu-surface";
import { ROUTES } from "@/lib/routes";
import { completeTaskAction, reopenTaskAction, unassignTaskUserAction } from "@/lib/tasks/actions";

import { DeleteTaskDialog } from "./delete-task-dialog";
import { TaskAssignDialog } from "./task-assign-dialog";
import { TaskEventTimeline } from "./task-event-timeline";
import { TaskFormDialog } from "./task-form-dialog";
import {
  computedStatusLabel,
  formatDueDateLong,
  priorityLabel,
} from "./task-utils";

type TaskDetailViewProps = {
  spaceId: string;
  initialTask: BackendTaskDto;
  initialEvents: BackendTaskEventDto[];
  members: BackendSpaceMemberDto[];
};

function statusBadgeClass(computed: BackendTaskDto["computedStatus"]): string {
  switch (computed) {
    case "completed":
      return "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";
    case "expired":
      return "bg-red-500/15 text-red-800 dark:text-red-200";
    default:
      return "bg-sky-500/15 text-sky-800 dark:text-sky-200";
  }
}

function priorityBadgeClass(p: BackendTaskDto["priority"]): string {
  switch (p) {
    case "high":
      return "bg-amber-500/15 text-amber-900 dark:text-amber-100";
    case "low":
      return "bg-[color-mix(in_srgb,var(--neu-text)_8%,transparent)] text-[var(--neu-text-muted)]";
    default:
      return "bg-[color-mix(in_srgb,var(--neu-accent)_18%,transparent)] text-[var(--neu-accent)]";
  }
}

function memberPhotoMeta(
  members: BackendSpaceMemberDto[],
  assignee: BackendTaskDto["assignees"][number],
): { name: string; imageUrl: string | null } {
  const m = members.find((x) => x.userId === assignee.userId);
  return {
    name: m?.name ?? assignee.user.name,
    imageUrl: m?.imageUrl ?? null,
  };
}

export function TaskDetailView({ spaceId, initialTask, initialEvents, members }: TaskDetailViewProps) {
  const router = useRouter();
  const [task, setTask] = useState(initialTask);
  const [events, setEvents] = useState(initialEvents);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setTask(initialTask);
    setEvents(initialEvents);
  }, [initialTask, initialEvents]);

  const refresh = () => {
    router.refresh();
  };

  const onComplete = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await completeTaskAction(spaceId, task.id);
      if (result.ok) {
        setTask(result.data);
        refresh();
        return;
      }
      setActionError(result.message);
    });
  };

  const onReopen = () => {
    setActionError(null);
    startTransition(async () => {
      const result = await reopenTaskAction(spaceId, task.id);
      if (result.ok) {
        setTask(result.data);
        refresh();
        return;
      }
      setActionError(result.message);
    });
  };

  const onUnassign = (userId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await unassignTaskUserAction(spaceId, task.id, userId);
      if (result.ok) {
        setTask(result.data);
        refresh();
        return;
      }
      setActionError(result.message);
    });
  };

  const due = formatDueDateLong(task.dueDate);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={ROUTES.app}
          className="text-sm text-[var(--neu-text-muted)] transition hover:text-[var(--neu-text)]"
        >
          ← Volver al inicio
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-[var(--neu-text)]">{task.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(task.computedStatus)}`}
              >
                {computedStatusLabel(task.computedStatus)}
              </span>
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityBadgeClass(task.priority)}`}
              >
                {priorityLabel(task.priority)}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.status === "pending" ? (
              <button
                type="button"
                className="neu-focus neu-raised rounded-[var(--neu-radius-sm)] px-4 py-2 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99] disabled:opacity-60"
                onClick={onComplete}
                disabled={pending}
              >
                Marcar completada
              </button>
            ) : (
              <button
                type="button"
                className="neu-focus neu-raised rounded-[var(--neu-radius-sm)] px-4 py-2 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99] disabled:opacity-60"
                onClick={onReopen}
                disabled={pending}
              >
                Reabrir
              </button>
            )}
            <button
              type="button"
              className="neu-focus neu-inset rounded-[var(--neu-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--neu-text)] transition active:scale-[0.99] disabled:opacity-60"
              onClick={() => setEditOpen(true)}
              disabled={pending}
            >
              Editar
            </button>
            <button
              type="button"
              className="neu-focus rounded-[var(--neu-radius-sm)] px-4 py-2 text-sm font-semibold text-red-800 transition hover:brightness-[1.02] active:scale-[0.99] dark:text-red-200"
              onClick={() => setDeleteOpen(true)}
              disabled={pending}
            >
              Eliminar
            </button>
          </div>
        </div>
        {actionError ? (
          <p className="mt-3 text-sm text-[var(--neu-text-muted)]" role="alert">
            {actionError}
          </p>
        ) : null}
      </div>

      <NeuSurface variant="raised" className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--neu-text)]">Detalles</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="text-[var(--neu-text-muted)]">Creada</dt>
            <dd className="text-[var(--neu-text)]">{formatDueDateLong(task.createdAt) ?? "—"}</dd>
          </div>
          {due ? (
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="text-[var(--neu-text-muted)]">Fecha límite</dt>
              <dd className="text-[var(--neu-text)]">{due}</dd>
            </div>
          ) : null}
          {task.completedAt ? (
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
              <dt className="text-[var(--neu-text-muted)]">Completada</dt>
              <dd className="text-[var(--neu-text)]">{formatDueDateLong(task.completedAt)}</dd>
            </div>
          ) : null}
        </dl>
        {task.description ? (
          <div className="mt-4 border-t border-[color-mix(in_srgb,var(--neu-text)_10%,transparent)] pt-4">
            <h3 className="text-sm font-medium text-[var(--neu-text-muted)]">Descripción</h3>
            <p className="mt-2 whitespace-pre-wrap text-pretty text-[var(--neu-text)]">{task.description}</p>
          </div>
        ) : null}
      </NeuSurface>

      <NeuSurface variant="raised" className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-[var(--neu-text)]">Asignados</h2>
          <button
            type="button"
            className="neu-focus neu-raised self-start rounded-[var(--neu-radius-sm)] px-4 py-2 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99] disabled:opacity-60"
            onClick={() => setAssignOpen(true)}
            disabled={pending}
          >
            Asignar
          </button>
        </div>
        {task.assignees.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--neu-text-muted)]">Nadie asignado aún.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {task.assignees.map((a) => {
              const { name, imageUrl } = memberPhotoMeta(members, a);
              return (
                <li
                  key={a.id}
                  className="neu-inset flex flex-row items-center justify-between gap-3 rounded-[var(--neu-radius-sm)] px-4 py-3 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-3" title={name}>
                    <MemberAvatar name={name} imageUrl={imageUrl} dimensionsClassName="h-10 w-10 sm:h-11 sm:w-11" />
                    <span className="sr-only">{name}</span>
                  </div>
                  <button
                    type="button"
                    className="neu-focus shrink-0 rounded-[var(--neu-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--neu-text-muted)] transition hover:text-red-700 dark:hover:text-red-300"
                    onClick={() => onUnassign(a.userId)}
                    disabled={pending}
                  >
                    Quitar
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </NeuSurface>

      <NeuSurface variant="raised" className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[var(--neu-text)]">Actividad</h2>
        <div className="mt-4">
          <TaskEventTimeline events={events} />
        </div>
      </NeuSurface>

      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        spaceId={spaceId}
        mode="edit"
        task={task}
        members={members}
        onSuccess={() => {
          refresh();
        }}
      />

      <DeleteTaskDialog
        spaceId={spaceId}
        taskId={task.id}
        taskTitle={task.title}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <TaskAssignDialog
        spaceId={spaceId}
        task={task}
        members={members}
        open={assignOpen}
        onOpenChange={setAssignOpen}
      />
    </div>
  );
}
