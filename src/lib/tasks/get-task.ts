import { cache } from "react";
import { redirect } from "next/navigation";

import {
  getBackendTask,
  getBackendTaskEvents,
  type BackendTaskDto,
  type BackendTaskEventDto,
} from "@/lib/api/backend-client";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

export const getTaskForPage = cache(async (spaceId: string, taskId: string): Promise<BackendTaskDto | null> => {
  const apiAccessToken = await getApiAccessTokenFromCookies();
  if (!apiAccessToken) {
    redirect(ROUTES.login);
  }

  try {
    return await getBackendTask(apiAccessToken, spaceId, taskId);
  } catch (e) {
    const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
    if (status === 401 || status === 403) {
      redirect(ROUTES.login);
    }
    if (status === 404) {
      return null;
    }
    throw e;
  }
});

export const getTaskEventsForPage = cache(
  async (spaceId: string, taskId: string): Promise<BackendTaskEventDto[]> => {
    const apiAccessToken = await getApiAccessTokenFromCookies();
    if (!apiAccessToken) {
      redirect(ROUTES.login);
    }

    try {
      return await getBackendTaskEvents(apiAccessToken, spaceId, taskId);
    } catch (e) {
      const status = e && typeof e === "object" && "status" in e ? (e as { status: number }).status : undefined;
      if (status === 401 || status === 403) {
        redirect(ROUTES.login);
      }
      if (status === 404) {
        return [];
      }
      throw e;
    }
  },
);
