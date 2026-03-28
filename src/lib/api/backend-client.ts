import { z } from "zod";

function getApiBaseUrl(): string {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) env variable for backend calls.",
    );
  }
  return baseUrl.replace(/\/+$/, "");
}

function messageFromNestErrorBody(body: string, fallback: string): string {
  try {
    const j = JSON.parse(body) as { message?: string | string[] };
    if (typeof j.message === "string") return j.message;
    if (Array.isArray(j.message)) return j.message.join(" ");
  } catch {
    /* not JSON */
  }
  return body.trim() || fallback;
}

export async function fetchBackend(
  path: string,
  options: Omit<RequestInit, "headers"> & {
    headers?: HeadersInit;
    apiAccessToken: string;
  },
): Promise<Response> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${options.apiAccessToken}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    ...options,
    headers,
    cache: "no-store",
  });
}

const authMeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  imageUrl: z.string().nullable(),
  publicCode: z.string(),
  googleSub: z.string().nullable(),
});

export async function getBackendMe(apiAccessToken: string) {
  const response = await fetchBackend("/auth/me", {
    method: "GET",
    apiAccessToken,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend /auth/me failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return authMeSchema.parse(raw);
}

const homeDtoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    createdByUserId: z.string().optional(),
  })
  .passthrough();

export type BackendHomeDto = z.infer<typeof homeDtoSchema>;

export async function getBackendHomes(apiAccessToken: string): Promise<BackendHomeDto[]> {
  const response = await fetchBackend("/homes", {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend /homes unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend /homes failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(homeDtoSchema).parse(raw);
}

export async function createBackendHome(apiAccessToken: string, name: string): Promise<BackendHomeDto> {
  const response = await fetchBackend("/homes", {
    method: "POST",
    apiAccessToken,
    body: JSON.stringify({ name }),
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend POST /homes unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend POST /homes failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return homeDtoSchema.parse(raw);
}

export async function deleteBackendHome(apiAccessToken: string, homeId: string): Promise<void> {
  const response = await fetchBackend(`/homes/${encodeURIComponent(homeId)}`, {
    method: "DELETE",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend DELETE /homes/${homeId} unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (response.status === 404) {
    const err = new Error("Este hogar ya no existe.");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend DELETE /homes failed with ${response.status}. ${body || "No body."}`);
  }
}

const taskDtoSchema = z
  .object({
    id: z.string(),
    homeId: z.string(),
    title: z.string(),
    computedStatus: z.enum(["completed", "expired", "pending"]),
  })
  .passthrough();

export type BackendTaskDto = z.infer<typeof taskDtoSchema>;

export async function getBackendTasks(apiAccessToken: string, homeId: string): Promise<BackendTaskDto[]> {
  const response = await fetchBackend(`/homes/${encodeURIComponent(homeId)}/tasks`, {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend GET /homes/${homeId}/tasks unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (response.status === 404) {
    const err = new Error("Hogar no encontrado.");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET /homes/${homeId}/tasks failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(taskDtoSchema).parse(raw);
}

const homeMemberDtoSchema = z.object({
  userId: z.string(),
  name: z.string(),
  publicCode: z.string(),
  role: z.enum(["owner", "member"]),
  joinedAt: z.string(),
});

export type BackendHomeMemberDto = z.infer<typeof homeMemberDtoSchema>;

export async function getBackendHomeMembers(
  apiAccessToken: string,
  homeId: string,
): Promise<BackendHomeMemberDto[]> {
  const response = await fetchBackend(`/homes/${encodeURIComponent(homeId)}/members`, {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend GET /homes/${homeId}/members unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (response.status === 404) {
    const err = new Error("Hogar no encontrado.");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET /homes/${homeId}/members failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(homeMemberDtoSchema).parse(raw);
}

const invitationStatusSchema = z.enum(["pending", "accepted", "rejected", "cancelled", "expired"]);

const simpleHomeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

const simpleUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  publicCode: z.string(),
});

export const invitationListItemSchema = z.object({
  id: z.string(),
  status: invitationStatusSchema,
  createdAt: z.string(),
  respondedAt: z.string().nullable(),
  home: simpleHomeSchema,
  invitedBy: simpleUserSchema.optional(),
  invitedUser: simpleUserSchema.optional(),
});

export type BackendInvitationListItem = z.infer<typeof invitationListItemSchema>;

export async function getBackendInvitationsSent(apiAccessToken: string): Promise<BackendInvitationListItem[]> {
  const response = await fetchBackend("/invitations/sent", {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend GET /invitations/sent unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET /invitations/sent failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(invitationListItemSchema).parse(raw);
}

export async function getBackendInvitationsReceived(
  apiAccessToken: string,
): Promise<BackendInvitationListItem[]> {
  const response = await fetchBackend("/invitations/received", {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend GET /invitations/received unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET /invitations/received failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(invitationListItemSchema).parse(raw);
}

const invitationResponseSchema = z
  .object({
    id: z.string(),
    homeId: z.string(),
    invitedByUserId: z.string(),
    invitedUserId: z.string(),
    status: invitationStatusSchema,
    createdAt: z.string(),
    respondedAt: z.string().nullable(),
  })
  .passthrough();

export async function createBackendInvitation(
  apiAccessToken: string,
  homeId: string,
  publicCode: string,
): Promise<z.infer<typeof invitationResponseSchema>> {
  const response = await fetchBackend(`/homes/${encodeURIComponent(homeId)}/invitations`, {
    method: "POST",
    apiAccessToken,
    body: JSON.stringify({ publicCode: publicCode.trim() }),
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend POST invitation unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(body, `Error al enviar invitación (${response.status}).`);
    const err = new Error(msg);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  const raw = await response.json();
  return invitationResponseSchema.parse(raw);
}

async function patchInvitation(
  apiAccessToken: string,
  invitationId: string,
  action: "accept" | "reject" | "cancel",
): Promise<z.infer<typeof invitationResponseSchema>> {
  const response = await fetchBackend(`/invitations/${encodeURIComponent(invitationId)}/${action}`, {
    method: "PATCH",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend PATCH invitation ${action} unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(body, `Error en invitación (${response.status}).`);
    const err = new Error(msg);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  const raw = await response.json();
  return invitationResponseSchema.parse(raw);
}

export function acceptBackendInvitation(apiAccessToken: string, invitationId: string) {
  return patchInvitation(apiAccessToken, invitationId, "accept");
}

export function rejectBackendInvitation(apiAccessToken: string, invitationId: string) {
  return patchInvitation(apiAccessToken, invitationId, "reject");
}

export function cancelBackendInvitation(apiAccessToken: string, invitationId: string) {
  return patchInvitation(apiAccessToken, invitationId, "cancel");
}
