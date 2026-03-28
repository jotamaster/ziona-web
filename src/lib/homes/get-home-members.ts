import { cache } from "react";
import { redirect } from "next/navigation";

import { getBackendHomeMembers, type BackendHomeMemberDto } from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

/**
 * Miembros activos del hogar (GET /homes/:homeId/members). Requiere membresía.
 */
export const getHomeMembers = cache(async (homeId: string): Promise<BackendHomeMemberDto[]> => {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  try {
    return await getBackendHomeMembers(apiAccessToken, homeId);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    throw e;
  }
});
