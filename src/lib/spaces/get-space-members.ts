import { cache } from "react";
import { redirect } from "next/navigation";

import { getBackendSpaceMembers, type BackendSpaceMemberDto } from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

/**
 * Miembros activos del espacio (GET /spaces/:spaceId/members). Requiere membresía.
 */
export const getSpaceMembers = cache(async (spaceId: string): Promise<BackendSpaceMemberDto[]> => {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  try {
    return await getBackendSpaceMembers(apiAccessToken, spaceId);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    throw e;
  }
});
