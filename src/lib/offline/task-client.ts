"use client";

import type { BackendSpaceMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import type { CreateBackendTaskBody, PatchBackendTaskBody } from "@/lib/api/backend-client";
import {
  assignTaskUsersAction,
  completeTaskAction,
  createTaskAction,
  deleteTaskAction,
  listTasksForSpaceAction,
  reopenTaskAction,
  unassignTaskUserAction,
  updateTaskAction,
  type TaskActionOk,
} from "@/lib/tasks/actions";
import { listSpaceMembersAction } from "@/lib/spaces/actions";
import {
  mergeTaskIntoList,
  optimisticAssign,
  optimisticComplete,
  optimisticCreateTask,
  optimisticPatchTask,
  optimisticReopen,
  optimisticUnassign,
  removeTaskFromList,
} from "./optimistic-task";
import { outboxAdd, outboxGetAll } from "./idb";
import type { OutboxRow } from "./outbox-types";
import { loadSpaceSnapshot, patchSpaceSnapshot, saveSpaceSnapshot } from "./snapshots";

import { flushOutbox } from "./sync-outbox";

export function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

async function upsertServerTask(spaceId: string, task: BackendTaskDto, members: BackendSpaceMemberDto[]) {
  await patchSpaceSnapshot(spaceId, (prev) => {
    const tasks = mergeTaskIntoList(prev?.tasks ?? [], task);
    return {
      tasks,
      members: prev?.members?.length ? prev.members : members,
      updatedAt: Date.now(),
    };
  });
}

async function replaceServerTasks(
  spaceId: string,
  tasks: BackendTaskDto[],
  members: BackendSpaceMemberDto[],
) {
  await saveSpaceSnapshot(spaceId, { tasks, members });
}

export type LoadTasksResult = {
  tasks: BackendTaskDto[] | null;
  members: BackendSpaceMemberDto[] | null;
  tasksError: string | null;
  membersError: string | null;
  fromCache: boolean;
};

/** Carga tareas y miembros: online intenta servidor; si falla o hay offline usa caché. */
export async function loadDashboardDataForSpace(spaceId: string): Promise<LoadTasksResult> {
  const snap = await loadSpaceSnapshot(spaceId);

  if (!isOffline()) {
    const [membersResult, tasksResult] = await Promise.all([
      listSpaceMembersAction(spaceId),
      listTasksForSpaceAction(spaceId),
    ]);

    let membersError: string | null = null;
    let members: BackendSpaceMemberDto[] | null = null;
    if (membersResult.ok) {
      members = membersResult.members;
    } else {
      membersError = membersResult.message;
      members = snap?.members ?? null;
    }

    let tasksError: string | null = null;
    let tasks: BackendTaskDto[] | null = null;
    if (tasksResult.ok) {
      tasks = tasksResult.tasks;
      const m = (members?.length ? members : snap?.members) ?? [];
      await replaceServerTasks(spaceId, tasks, m);
    } else {
      tasksError = tasksResult.message;
      tasks = snap?.tasks ?? null;
    }

    const fromCache = Boolean(
      (!tasksResult.ok && tasks != null && tasks.length > 0) ||
        (!membersResult.ok && members != null && members.length > 0),
    );

    return {
      tasks,
      members,
      tasksError,
      membersError,
      fromCache,
    };
  }

  return {
    tasks: snap?.tasks ?? null,
    members: snap?.members ?? null,
    tasksError: snap?.tasks
      ? null
      : "Sin conexión: abre la app con red al menos una vez en este espacio.",
    membersError: snap?.members
      ? null
      : "Sin conexión: sin datos de miembros en caché.",
    fromCache: true,
  };
}

export async function getOutboxPendingCount(): Promise<number> {
  const rows = await outboxGetAll<OutboxRow>();
  return rows.length;
}

export async function clientCreateTask(
  spaceId: string,
  body: CreateBackendTaskBody,
  members: BackendSpaceMemberDto[],
): Promise<TaskActionOk<BackendTaskDto>> {
  if (!isOffline()) {
    const r = await createTaskAction(spaceId, body);
    if (r.ok) {
      await upsertServerTask(spaceId, r.data, members);
      await flushOutbox();
    }
    return r;
  }
  const tempId = `local-${crypto.randomUUID()}`;
  const optimistic = optimisticCreateTask(spaceId, tempId, body, members);
  await patchSpaceSnapshot(spaceId, (prev) => ({
    tasks: mergeTaskIntoList(prev?.tasks ?? [], optimistic),
    members: prev?.members?.length ? prev.members : members,
    updatedAt: Date.now(),
  }));
  const row: OutboxRow = { op: "create", spaceId, taskId: tempId, body };
  await outboxAdd(row);
  void flushOutbox();
  return { ok: true, data: optimistic };
}

export async function clientUpdateTask(
  spaceId: string,
  taskId: string,
  body: PatchBackendTaskBody,
  current: BackendTaskDto,
  members: BackendSpaceMemberDto[],
): Promise<TaskActionOk<BackendTaskDto>> {
  if (!isOffline()) {
    const r = await updateTaskAction(spaceId, taskId, body);
    if (r.ok) {
      await upsertServerTask(spaceId, r.data, members);
      await flushOutbox();
    }
    return r;
  }
  const next = optimisticPatchTask(current, body);
  await patchSpaceSnapshot(spaceId, (prev) => ({
    tasks: mergeTaskIntoList(prev?.tasks ?? [], next),
    members: prev?.members?.length ? prev.members : members,
    updatedAt: Date.now(),
  }));
  await outboxAdd<OutboxRow>({ op: "update", spaceId, taskId, body });
  void flushOutbox();
  return { ok: true, data: next };
}

export async function clientDeleteTask(
  spaceId: string,
  taskId: string,
): Promise<TaskActionOk<void>> {
  if (!isOffline()) {
    const r = await deleteTaskAction(spaceId, taskId);
    if (r.ok) {
      await patchSpaceSnapshot(spaceId, (prev) => ({
        tasks: removeTaskFromList(prev?.tasks ?? [], taskId),
        members: prev?.members ?? [],
        updatedAt: Date.now(),
      }));
      await flushOutbox();
    }
    return r;
  }
  await patchSpaceSnapshot(spaceId, (prev) => ({
    tasks: removeTaskFromList(prev?.tasks ?? [], taskId),
    members: prev?.members ?? [],
    updatedAt: Date.now(),
  }));
  await outboxAdd<OutboxRow>({ op: "delete", spaceId, taskId });
  void flushOutbox();
  return { ok: true, data: undefined };
}

export async function clientCompleteTask(
  spaceId: string,
  taskId: string,
  current: BackendTaskDto,
  members: BackendSpaceMemberDto[],
): Promise<TaskActionOk<BackendTaskDto>> {
  if (!isOffline()) {
    const r = await completeTaskAction(spaceId, taskId);
    if (r.ok) {
      await upsertServerTask(spaceId, r.data, members);
      await flushOutbox();
    }
    return r;
  }
  const next = optimisticComplete(current);
  await patchSpaceSnapshot(spaceId, (prev) => ({
    tasks: mergeTaskIntoList(prev?.tasks ?? [], next),
    members: prev?.members?.length ? prev.members : members,
    updatedAt: Date.now(),
  }));
  await outboxAdd<OutboxRow>({ op: "complete", spaceId, taskId });
  void flushOutbox();
  return { ok: true, data: next };
}

export async function clientReopenTask(
  spaceId: string,
  taskId: string,
  current: BackendTaskDto,
  members: BackendSpaceMemberDto[],
): Promise<TaskActionOk<BackendTaskDto>> {
  if (!isOffline()) {
    const r = await reopenTaskAction(spaceId, taskId);
    if (r.ok) {
      await upsertServerTask(spaceId, r.data, members);
      await flushOutbox();
    }
    return r;
  }
  const next = optimisticReopen(current);
  await patchSpaceSnapshot(spaceId, (prev) => ({
    tasks: mergeTaskIntoList(prev?.tasks ?? [], next),
    members: prev?.members?.length ? prev.members : members,
    updatedAt: Date.now(),
  }));
  await outboxAdd<OutboxRow>({ op: "reopen", spaceId, taskId });
  void flushOutbox();
  return { ok: true, data: next };
}

export async function clientAssignTask(
  spaceId: string,
  taskId: string,
  userIds: string[],
  current: BackendTaskDto,
  members: BackendSpaceMemberDto[],
): Promise<TaskActionOk<BackendTaskDto>> {
  if (!isOffline()) {
    const r = await assignTaskUsersAction(spaceId, taskId, userIds);
    if (r.ok) {
      await upsertServerTask(spaceId, r.data, members);
      await flushOutbox();
    }
    return r;
  }
  const next = optimisticAssign(current, userIds, members);
  await patchSpaceSnapshot(spaceId, (prev) => ({
    tasks: mergeTaskIntoList(prev?.tasks ?? [], next),
    members: prev?.members?.length ? prev.members : members,
    updatedAt: Date.now(),
  }));
  await outboxAdd<OutboxRow>({ op: "assign", spaceId, taskId, userIds });
  void flushOutbox();
  return { ok: true, data: next };
}

export async function clientUnassignTask(
  spaceId: string,
  taskId: string,
  userId: string,
  current: BackendTaskDto,
  members: BackendSpaceMemberDto[],
): Promise<TaskActionOk<BackendTaskDto>> {
  if (!isOffline()) {
    const r = await unassignTaskUserAction(spaceId, taskId, userId);
    if (r.ok) {
      await upsertServerTask(spaceId, r.data, members);
      await flushOutbox();
    }
    return r;
  }
  const next = optimisticUnassign(current, userId);
  await patchSpaceSnapshot(spaceId, (prev) => ({
    tasks: mergeTaskIntoList(prev?.tasks ?? [], next),
    members: prev?.members?.length ? prev.members : members,
    updatedAt: Date.now(),
  }));
  await outboxAdd<OutboxRow>({ op: "unassign", spaceId, taskId, userId });
  void flushOutbox();
  return { ok: true, data: next };
}

/** Tarea para vista detalle: online usa servidor; offline solo caché. */
export async function clientGetTask(spaceId: string, taskId: string): Promise<TaskActionOk<BackendTaskDto>> {
  const { getTaskForSpaceAction } = await import("@/lib/tasks/actions");
  if (!isOffline()) {
    return getTaskForSpaceAction(spaceId, taskId);
  }
  const snap = await loadSpaceSnapshot(spaceId);
  const task = snap?.tasks.find((t) => t.id === taskId) ?? null;
  if (!task) {
    return { ok: false, message: "Tarea no encontrada en el dispositivo (sin conexión)." };
  }
  return { ok: true, data: task };
}
