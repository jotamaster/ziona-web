"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createBackendHome, deleteBackendHome } from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

const homeNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(80, "Máximo 80 caracteres.");

export type CreateHomeState = { ok: true; homeId: string } | { ok: false; message: string };
export type DeleteHomeState = { ok: true } | { ok: false; message: string };

export async function createHomeAction(name: string): Promise<CreateHomeState> {
  const parsed = homeNameSchema.safeParse(name);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Nombre inválido.";
    return { ok: false, message: msg };
  }

  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  try {
    const created = await createBackendHome(apiAccessToken, parsed.data);
    revalidatePath(ROUTES.app);
    revalidatePath(ROUTES.homes);
    return { ok: true, homeId: created.id };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    const message = e instanceof Error ? e.message : "No se pudo crear el hogar.";
    return { ok: false, message };
  }
}

export async function deleteHomeAction(homeId: string): Promise<DeleteHomeState> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = homeId?.trim();
  if (!id) {
    return { ok: false, message: "Hogar inválido." };
  }

  try {
    await deleteBackendHome(apiAccessToken, id);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para eliminar este hogar." };
    }
    if (status === 404) {
      return { ok: false, message: "Este hogar ya no existe." };
    }
    const message = e instanceof Error ? e.message : "No se pudo eliminar el hogar.";
    return { ok: false, message };
  }

  revalidatePath(ROUTES.app);
  revalidatePath(ROUTES.homes);
  return { ok: true };
}
