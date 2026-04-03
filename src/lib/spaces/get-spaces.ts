import { cache } from "react";
import { redirect } from "next/navigation";

import { getBackendSpaces } from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

import type { Space } from "./types";

function mapToSpace(dto: { id: string; name: string; createdByUserId?: string }): Space {
  return {
    id: dto.id,
    name: dto.name,
    ...(dto.createdByUserId !== undefined ? { createdByUserId: dto.createdByUserId } : {}),
  };
}

/**
 * Espacios del usuario autenticado (GET /spaces).
 * Cacheada por request de React para compartir resultado entre layout y páginas.
 *
 * Contrato con backend: la lista viene ordenada por `createdAt` descendente — el índice 0 es el espacio **más reciente**.
 */
export const getSpaces = cache(async (): Promise<Space[]> => {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  try {
    const list = await getBackendSpaces(apiAccessToken);
    return list.map(mapToSpace);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    // Sin red o error de servidor: el cliente puede hidratar desde IndexedDB.
    return [];
  }
});
