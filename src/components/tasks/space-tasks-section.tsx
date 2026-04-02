"use client";

import Link from "next/link";
import { useState } from "react";

import type { BackendSpaceMemberDto } from "@/lib/api/backend-client";
import type { BackendTaskDto } from "@/lib/api/backend-client";
import { NeuSurface } from "@/components/ui/neu-surface";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { routeSpaceTask } from "@/lib/routes";

import { TaskFormDialog } from "./task-form-dialog";
import {
  computedStatusLabel,
  formatDueDateShort,
  priorityLabel,
} from "./task-utils";

type SpaceTasksSectionProps = {
  spaceId: string;
  spaceName: string;
  tasks: BackendTaskDto[] | null;
  loading: boolean;
  error: string | null;
  members: BackendSpaceMemberDto[] | null;
  onTasksMutated?: () => void;
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

function assigneeDisplay(
  members: BackendSpaceMemberDto[],
  assignee: BackendTaskDto["assignees"][number],
): { name: string; imageUrl: string | null } {
  const m = members.find((x) => x.userId === assignee.userId);
  return {
    name: m?.name ?? assignee.user.name,
    imageUrl: m?.imageUrl ?? null,
  };
}

function AssigneeAvatars({
  assignees,
  members,
}: {
  assignees: BackendTaskDto["assignees"];
  members: BackendSpaceMemberDto[];
}) {
  if (assignees.length === 0) {
    return <span className="text-xs text-[var(--neu-text-muted)]">Sin asignar</span>;
  }
  const shown = assignees.slice(0, 4);
  const rest = assignees.length - shown.length;
  return (
    <div className="flex items-center justify-end" aria-label="Personas asignadas">
      <div className="flex -space-x-2">
        {shown.map((a) => {
          const { name, imageUrl } = assigneeDisplay(members, a);
          return (
            <div
              key={a.id}
              className=" ring-[var(--neu-bg)] dark:ring-[var(--neu-bg)]"
              title={name}
            >
              <MemberAvatar name={name} imageUrl={imageUrl} dimensionsClassName="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
          );
        })}
      </div>
      {rest > 0 ? (
        <span className="ml-2 text-xs font-medium tabular-nums text-[var(--neu-text-muted)]">+{rest}</span>
      ) : null}
    </div>
  );
}

export function SpaceTasksSection({
  spaceId,
  spaceName,
  tasks,
  loading,
  error,
  members,
  onTasksMutated,
}: SpaceTasksSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const memberList = members ?? [];

  return (
    <>
      <NeuSurface variant="raised" className="p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--neu-text)]">Tareas</h2>
            <p className="mt-1 text-pretty text-sm text-[var(--neu-text-muted)]">
              Tareas del espacio <span className="font-medium text-[var(--neu-text)]">{spaceName}</span>.
            </p>
          </div>
          <button
            type="button"
            className="neu-focus neu-raised shrink-0 rounded-[var(--neu-radius-sm)] px-4 py-2.5 text-sm font-semibold text-[var(--neu-accent)] transition hover:brightness-[1.02] active:scale-[0.99]"
            onClick={() => setCreateOpen(true)}
          >
            Agregar tarea
          </button>
        </div>

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
              onClick={() => setCreateOpen(true)}
            >
              Agregar tarea
            </button>
          </div>
        ) : null}

        {!loading && tasks && tasks.length > 0 ? (
          <ul className="mt-6 flex flex-col gap-2">
            {tasks.map((t) => {
              const due = formatDueDateShort(t.dueDate);
              const isCompleted = t.computedStatus === "completed";
              return (
                <li key={t.id}>
                  <Link
                    href={routeSpaceTask(spaceId, t.id)}
                    className={
                      isCompleted
                        ? "neu-focus neu-raised flex flex-col gap-2 rounded-[var(--neu-radius-sm)] border border-white/30 px-4 py-3 text-sm text-[var(--neu-text)] opacity-75 transition hover:brightness-[1.02] hover:opacity-90 sm:flex-row sm:items-center sm:justify-between dark:border-white/10"
                        : "neu-focus neu-inset flex flex-col gap-2 rounded-[var(--neu-radius-sm)] px-4 py-3 text-sm text-[var(--neu-text)] transition hover:brightness-[1.01] sm:flex-row sm:items-center sm:justify-between"
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            isCompleted
                              ? "font-medium text-[var(--neu-text-muted)] line-through decoration-[var(--neu-text-muted)]/80"
                              : "font-medium"
                          }
                        >
                          {t.title}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${statusBadgeClass(t.computedStatus)}`}
                        >
                          {computedStatusLabel(t.computedStatus)}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold sm:text-xs ${priorityBadgeClass(t.priority)}`}
                        >
                          {priorityLabel(t.priority)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--neu-text-muted)]">
                        {due ? <span>Vence {due}</span> : <span>Sin fecha límite</span>}
                      </div>
                    </div>
                    <div className="shrink-0 sm:max-w-[40%] sm:text-right">
                      <AssigneeAvatars assignees={t.assignees} members={memberList} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </NeuSurface>

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        spaceId={spaceId}
        mode="create"
        members={memberList}
        onSuccess={onTasksMutated}
      />
    </>
  );
}
