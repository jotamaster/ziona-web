"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  completeBackendTask,
  createBackendTask,
  deleteBackendTask,
  deleteBackendTaskAssignee,
  getBackendTask,
  getBackendTaskEvents,
  getBackendTasks,
  patchBackendTask,
  postBackendTaskAssignees,
  reopenBackendTask,
  type BackendTaskDto,
  type BackendTaskEventDto,
  type CreateBackendTaskBody,
  type PatchBackendTaskBody,
} from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES, routeSpaceAdmin, routeSpaceTask } from "@/lib/routes";

export type ListTasksState = { ok: true; tasks: BackendTaskDto[] } | { ok: false; message: string };

export type TaskActionOk<T> = { ok: true; data: T } | { ok: false; message: string };

function getErrorStatus(e: unknown): number | undefined {
  return e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
}

function revalidateTaskViews(spaceId: string, taskId?: string) {
  revalidatePath(ROUTES.app);
  revalidatePath(routeSpaceAdmin(spaceId));
  if (taskId) {
    revalidatePath(routeSpaceTask(spaceId, taskId));
  }
}

async function requireToken(): Promise<string | null> {
  return getApiAccessTokenFromCookies();
}

export async function listTasksForSpaceAction(spaceId: string): Promise<ListTasksState> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = spaceId?.trim();
  if (!id) {
    return { ok: false, message: "Espacio inválido." };
  }

  try {
    const tasks = await getBackendTasks(apiAccessToken, id);
    return { ok: true, tasks };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes acceso a las tareas de este espacio." };
    }
    if (status === 404) {
      return { ok: false, message: "Este espacio no existe." };
    }
    const message = e instanceof Error ? e.message : "No se pudieron cargar las tareas.";
    return { ok: false, message };
  }
}

export async function getTaskForSpaceAction(spaceId: string, taskId: string): Promise<TaskActionOk<BackendTaskDto>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  if (!h || !t) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    const task = await getBackendTask(apiAccessToken, h, t);
    return { ok: true, data: task };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes acceso a esta tarea." };
    }
    if (status === 404) {
      return { ok: false, message: "Tarea no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo cargar la tarea.";
    return { ok: false, message };
  }
}

export async function getTaskEventsAction(
  spaceId: string,
  taskId: string,
): Promise<TaskActionOk<BackendTaskEventDto[]>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  if (!h || !t) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    const events = await getBackendTaskEvents(apiAccessToken, h, t);
    return { ok: true, data: events };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes acceso al historial." };
    }
    if (status === 404) {
      return { ok: false, message: "Tarea no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo cargar el historial.";
    return { ok: false, message };
  }
}

export async function createTaskAction(
  spaceId: string,
  body: CreateBackendTaskBody,
): Promise<TaskActionOk<BackendTaskDto>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  if (!h) {
    return { ok: false, message: "Espacio inválido." };
  }

  try {
    const task = await createBackendTask(apiAccessToken, h, body);
    revalidateTaskViews(h, task.id);
    return { ok: true, data: task };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No puedes crear tareas en este espacio." };
    }
    if (status === 404) {
      return { ok: false, message: "Este espacio no existe." };
    }
    const message = e instanceof Error ? e.message : "No se pudo crear la tarea.";
    return { ok: false, message };
  }
}

export async function updateTaskAction(
  spaceId: string,
  taskId: string,
  body: PatchBackendTaskBody,
): Promise<TaskActionOk<BackendTaskDto>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  if (!h || !t) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    const task = await patchBackendTask(apiAccessToken, h, t, body);
    revalidateTaskViews(h, t);
    return { ok: true, data: task };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para editar esta tarea." };
    }
    if (status === 404) {
      return { ok: false, message: "Tarea no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo actualizar la tarea.";
    return { ok: false, message };
  }
}

export async function deleteTaskAction(spaceId: string, taskId: string): Promise<TaskActionOk<void>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  if (!h || !t) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    await deleteBackendTask(apiAccessToken, h, t);
    revalidateTaskViews(h);
    return { ok: true, data: undefined };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para eliminar esta tarea." };
    }
    if (status === 404) {
      return { ok: false, message: "Tarea no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo eliminar la tarea.";
    return { ok: false, message };
  }
}

export async function completeTaskAction(spaceId: string, taskId: string): Promise<TaskActionOk<BackendTaskDto>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  if (!h || !t) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    const task = await completeBackendTask(apiAccessToken, h, t);
    revalidateTaskViews(h, t);
    return { ok: true, data: task };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para completar esta tarea." };
    }
    if (status === 404) {
      return { ok: false, message: "Tarea no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo completar la tarea.";
    return { ok: false, message };
  }
}

export async function reopenTaskAction(spaceId: string, taskId: string): Promise<TaskActionOk<BackendTaskDto>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  if (!h || !t) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    const task = await reopenBackendTask(apiAccessToken, h, t);
    revalidateTaskViews(h, t);
    return { ok: true, data: task };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para reabrir esta tarea." };
    }
    if (status === 404) {
      return { ok: false, message: "Tarea no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo reabrir la tarea.";
    return { ok: false, message };
  }
}

export async function assignTaskUsersAction(
  spaceId: string,
  taskId: string,
  userIds: string[],
): Promise<TaskActionOk<BackendTaskDto>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  if (!h || !t) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    const task = await postBackendTaskAssignees(apiAccessToken, h, t, userIds);
    revalidateTaskViews(h, t);
    return { ok: true, data: task };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para asignar." };
    }
    if (status === 404) {
      return { ok: false, message: "Tarea no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo asignar.";
    return { ok: false, message };
  }
}

export async function unassignTaskUserAction(
  spaceId: string,
  taskId: string,
  userId: string,
): Promise<TaskActionOk<BackendTaskDto>> {
  const apiAccessToken = await requireToken();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const h = spaceId?.trim();
  const t = taskId?.trim();
  const u = userId?.trim();
  if (!h || !t || !u) {
    return { ok: false, message: "Datos inválidos." };
  }

  try {
    const task = await deleteBackendTaskAssignee(apiAccessToken, h, t, u);
    revalidateTaskViews(h, t);
    return { ok: true, data: task };
  } catch (e) {
    const status = getErrorStatus(e);
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para desasignar." };
    }
    if (status === 404) {
      return { ok: false, message: "Asignación no encontrada." };
    }
    const message = e instanceof Error ? e.message : "No se pudo desasignar.";
    return { ok: false, message };
  }
}
