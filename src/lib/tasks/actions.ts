"use server";

import { redirect } from "next/navigation";

import { getBackendTasks, type BackendTaskDto } from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

export type ListTasksState = { ok: true; tasks: BackendTaskDto[] } | { ok: false; message: string };

export async function listTasksForHomeAction(homeId: string): Promise<ListTasksState> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = homeId?.trim();
  if (!id) {
    return { ok: false, message: "Hogar inválido." };
  }

  try {
    const tasks = await getBackendTasks(apiAccessToken, id);
    return { ok: true, tasks };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes acceso a las tareas de este hogar." };
    }
    if (status === 404) {
      return { ok: false, message: "Este hogar no existe." };
    }
    const message = e instanceof Error ? e.message : "No se pudieron cargar las tareas.";
    return { ok: false, message };
  }
}
