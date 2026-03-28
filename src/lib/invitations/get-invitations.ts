import { cache } from "react";
import { redirect } from "next/navigation";

import {
  getBackendInvitationsReceived,
  getBackendInvitationsSent,
  type BackendInvitationListItem,
} from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

async function ensureToken(): Promise<string> {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }
  return apiAccessToken;
}

export const getInvitationsSent = cache(async (): Promise<BackendInvitationListItem[]> => {
  const token = await ensureToken();
  try {
    return await getBackendInvitationsSent(token);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    throw e;
  }
});

export const getInvitationsReceived = cache(async (): Promise<BackendInvitationListItem[]> => {
  const token = await ensureToken();
  try {
    return await getBackendInvitationsReceived(token);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    throw e;
  }
});
