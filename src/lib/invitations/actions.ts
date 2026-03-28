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
import { ROUTES, routeHomeAdmin } from "@/lib/routes";

const publicCodeSchema = z.string().trim().min(1, "El código público es obligatorio.").max(64, "Máximo 64 caracteres.");

export type InvitationMutationState = { ok: true } | { ok: false; message: string };

function revalidateInvitationsAndHome(homeId?: string) {
  revalidatePath(ROUTES.invitations);
  revalidatePath(ROUTES.homes);
  if (homeId) {
    revalidatePath(routeHomeAdmin(homeId));
  }
}

export async function createInvitationAction(homeId: string, publicCode: string): Promise<InvitationMutationState> {
  const parsed = publicCodeSchema.safeParse(publicCode);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Código inválido." };
  }

  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  const id = homeId?.trim();
  if (!id) {
    return { ok: false, message: "Hogar inválido." };
  }

  try {
    await createBackendInvitation(apiAccessToken, id, parsed.data);
    revalidateInvitationsAndHome(id);
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
    revalidateInvitationsAndHome(res.homeId);
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
    revalidateInvitationsAndHome();
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
    revalidateInvitationsAndHome(res.homeId);
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
