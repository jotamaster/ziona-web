import type { BackendSpaceMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import type { CreateBackendTaskBody, PatchBackendTaskBody } from "@/lib/api/backend-client";

const PLACEHOLDER_USER = { id: "local-user", name: "Tú", publicCode: "—" };

function computeComputed(task: Pick<BackendTaskDto, "status" | "dueDate">): BackendTaskDto["computedStatus"] {
  if (task.status === "completed") return "completed";
  if (task.dueDate) {
    const d = new Date(task.dueDate);
    if (!Number.isNaN(d.getTime()) && d.getTime() < Date.now()) return "expired";
  }
  return "pending";
}

function buildAssignees(
  members: BackendSpaceMemberDto[],
  userIds: string[],
): BackendTaskDto["assignees"] {
  const now = new Date().toISOString();
  return userIds.map((userId, i) => {
    const m = members.find((x) => x.userId === userId);
    return {
      id: `local-assign-${userId}-${i}`,
      userId,
      assignedAt: now,
      user: { id: userId, name: m?.name ?? "Usuario", publicCode: m?.publicCode ?? "—" },
    };
  });
}

export function optimisticCreateTask(
  spaceId: string,
  tempId: string,
  body: CreateBackendTaskBody,
  members: BackendSpaceMemberDto[],
): BackendTaskDto {
  const now = new Date().toISOString();
  const assignees = body.assigneeUserIds?.length
    ? buildAssignees(members, body.assigneeUserIds)
    : [];
  const task: BackendTaskDto = {
    id: tempId,
    spaceId,
    title: body.title,
    description: body.description ?? null,
    priority: body.priority ?? "medium",
    dueDate: body.dueDate ?? null,
    status: "pending",
    computedStatus: computeComputed({ status: "pending", dueDate: body.dueDate ?? null }),
    createdAt: now,
    updatedAt: now,
    completedAt: null,
    createdByUser: PLACEHOLDER_USER,
    updatedByUser: PLACEHOLDER_USER,
    completedByUser: null,
    assignees,
  };
  return task;
}

export function optimisticPatchTask(task: BackendTaskDto, body: PatchBackendTaskBody): BackendTaskDto {
  const next: BackendTaskDto = {
    ...task,
    ...(body.title !== undefined ? { title: body.title } : {}),
    ...(body.description !== undefined ? { description: body.description } : {}),
    ...(body.priority !== undefined ? { priority: body.priority } : {}),
    ...(body.dueDate !== undefined ? { dueDate: body.dueDate } : {}),
    updatedAt: new Date().toISOString(),
  };
  next.computedStatus = computeComputed(next);
  return next;
}

export function optimisticComplete(task: BackendTaskDto): BackendTaskDto {
  const now = new Date().toISOString();
  return {
    ...task,
    status: "completed",
    computedStatus: "completed",
    completedAt: now,
    updatedAt: now,
    completedByUser: task.completedByUser ?? PLACEHOLDER_USER,
  };
}

export function optimisticReopen(task: BackendTaskDto): BackendTaskDto {
  const now = new Date().toISOString();
  return {
    ...task,
    status: "pending",
    computedStatus: computeComputed({ status: "pending", dueDate: task.dueDate }),
    completedAt: null,
    updatedAt: now,
    completedByUser: null,
  };
}

export function optimisticAssign(
  task: BackendTaskDto,
  userIds: string[],
  members: BackendSpaceMemberDto[],
): BackendTaskDto {
  const existing = new Map(task.assignees.map((a) => [a.userId, a]));
  const add = buildAssignees(
    members,
    userIds.filter((id) => !existing.has(id)),
  );
  return {
    ...task,
    assignees: [...task.assignees, ...add],
    updatedAt: new Date().toISOString(),
  };
}

export function optimisticUnassign(task: BackendTaskDto, userId: string): BackendTaskDto {
  return {
    ...task,
    assignees: task.assignees.filter((a) => a.userId !== userId),
    updatedAt: new Date().toISOString(),
  };
}

export function mergeTaskIntoList(tasks: BackendTaskDto[], task: BackendTaskDto): BackendTaskDto[] {
  const i = tasks.findIndex((t) => t.id === task.id);
  if (i === -1) return [...tasks, task];
  const copy = [...tasks];
  copy[i] = task;
  return copy;
}

export function removeTaskFromList(tasks: BackendTaskDto[], taskId: string): BackendTaskDto[] {
  return tasks.filter((t) => t.id !== taskId);
}
