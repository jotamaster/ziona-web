import { cache } from "react";
import { redirect } from "next/navigation";

import { getBackendHomes } from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

import type { Home } from "./types";

function mapToHome(dto: { id: string; name: string; createdByUserId?: string }): Home {
  return {
    id: dto.id,
    name: dto.name,
    ...(dto.createdByUserId !== undefined ? { createdByUserId: dto.createdByUserId } : {}),
  };
}

/**
 * Hogares del usuario autenticado (GET /homes).
 * Cacheada por request de React para compartir resultado entre layout y páginas.
 */
export const getHomes = cache(async (): Promise<Home[]> => {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  try {
    const list = await getBackendHomes(apiAccessToken);
    return list.map(mapToHome);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    throw e;
  }
});
