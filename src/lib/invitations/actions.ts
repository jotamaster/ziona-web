"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  acceptBackendInvitation,
  cancelBackendInvitation,
  createBackendInvitation,
  rejectBackendInvitation,
} from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES, routeSpaceAdmin } from "@/lib/routes";

const publicCodeSchema = z.string().trim().min(1, "El código público es obligatorio.").max(64, "Máximo 64 caracteres.");

export type InvitationMutationState = { ok: true } | { ok: false; message: string };

function revalidateInvitationsAndSpace(spaceId?: string) {
  revalidatePath(ROUTES.invitations);
  revalidatePath(ROUTES.spaces);
  if (spaceId) {
    revalidatePath(routeSpaceAdmin(spaceId));
  }
}

export async function createInvitationAction(spaceId: string, publicCode: string): Promise<InvitationMutationState> {
  const parsed = publicCodeSchema.safeParse(publicCode);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Código inválido." };
  }

  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = spaceId?.trim();
  if (!id) {
    return { ok: false, message: "Espacio inválido." };
  }

  try {
    await createBackendInvitation(apiAccessToken, id, parsed.data);
    revalidateInvitationsAndSpace(id);
    return { ok: true };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    const message = e instanceof Error ? e.message : "No se pudo enviar la invitación.";
    return { ok: false, message };
  }
}

export async function acceptInvitationAction(invitationId: string): Promise<InvitationMutationState> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = invitationId?.trim();
  if (!id) {
    return { ok: false, message: "Invitación inválida." };
  }

  try {
    const res = await acceptBackendInvitation(apiAccessToken, id);
    revalidateInvitationsAndSpace(res.spaceId);
    revalidatePath(ROUTES.app);
    return { ok: true };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    const message = e instanceof Error ? e.message : "No se pudo aceptar la invitación.";
    return { ok: false, message };
  }
}

export async function rejectInvitationAction(invitationId: string): Promise<InvitationMutationState> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = invitationId?.trim();
  if (!id) {
    return { ok: false, message: "Invitación inválida." };
  }

  try {
    await rejectBackendInvitation(apiAccessToken, id);
    revalidateInvitationsAndSpace();
    return { ok: true };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    const message = e instanceof Error ? e.message : "No se pudo rechazar la invitación.";
    return { ok: false, message };
  }
}

export async function cancelInvitationAction(invitationId: string): Promise<InvitationMutationState> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = invitationId?.trim();
  if (!id) {
    return { ok: false, message: "Invitación inválida." };
  }

  try {
    const res = await cancelBackendInvitation(apiAccessToken, id);
    revalidateInvitationsAndSpace(res.spaceId);
    return { ok: true };
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    const message = e instanceof Error ? e.message : "No se pudo cancelar la invitación.";
    return { ok: false, message };
  }
}
