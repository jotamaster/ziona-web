"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  createBackendSpace,
  deleteBackendSpace,
  getBackendSpaceMembers,
  type BackendSpaceMemberDto,
} from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

const spaceNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(80, "Máximo 80 caracteres.");

export type CreateSpaceState = { ok: true; spaceId: string } | { ok: false; message: string };
export type DeleteSpaceState = { ok: true } | { ok: false; message: string };
export type ListSpaceMembersState =
  | { ok: true; members: BackendSpaceMemberDto[] }
  | { ok: false; message: string };

export async function listSpaceMembersAction(spaceId: string): Promise<ListSpaceMembersState> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = spaceId?.trim();
  if (!id) {
    return { ok: false, message: "Espacio inválido." };
  }

  try {
    const members = await getBackendSpaceMembers(apiAccessToken, id);
    return { ok: true, members };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes acceso a los miembros de este espacio." };
    }
    if (status === 404) {
      return { ok: false, message: "Este espacio no existe." };
    }
    const message = e instanceof Error ? e.message : "No se pudieron cargar los miembros.";
    return { ok: false, message };
  }
}

export async function createSpaceAction(name: string): Promise<CreateSpaceState> {
  const parsed = spaceNameSchema.safeParse(name);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Nombre inválido.";
    return { ok: false, message: msg };
  }

  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  try {
    const created = await createBackendSpace(apiAccessToken, parsed.data);
    revalidatePath(ROUTES.app);
    revalidatePath(ROUTES.spaces);
    return { ok: true, spaceId: created.id };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    const message = e instanceof Error ? e.message : "No se pudo crear el espacio.";
    return { ok: false, message };
  }
}

export async function deleteSpaceAction(spaceId: string): Promise<DeleteSpaceState> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = spaceId?.trim();
  if (!id) {
    return { ok: false, message: "Espacio inválido." };
  }

  try {
    await deleteBackendSpace(apiAccessToken, id);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401) {
      redirect(ROUTES.login);
    }
    if (status === 403) {
      return { ok: false, message: "No tienes permiso para eliminar este espacio." };
    }
    if (status === 404) {
      return { ok: false, message: "Este espacio ya no existe." };
    }
    const message = e instanceof Error ? e.message : "No se pudo eliminar el espacio.";
    return { ok: false, message };
  }

  revalidatePath(ROUTES.app);
  revalidatePath(ROUTES.spaces);
  return { ok: true };
}
