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

const spaceDtoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    createdByUserId: z.string().optional(),
  })
  .passthrough();

export type BackendSpaceDto = z.infer<typeof spaceDtoSchema>;

export async function getBackendSpaces(apiAccessToken: string): Promise<BackendSpaceDto[]> {
  const response = await fetchBackend("/spaces", {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend /spaces unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend /spaces failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(spaceDtoSchema).parse(raw);
}

export async function createBackendSpace(apiAccessToken: string, name: string): Promise<BackendSpaceDto> {
  const response = await fetchBackend("/spaces", {
    method: "POST",
    apiAccessToken,
    body: JSON.stringify({ name }),
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend POST /spaces unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend POST /spaces failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return spaceDtoSchema.parse(raw);
}

export async function deleteBackendSpace(apiAccessToken: string, spaceId: string): Promise<void> {
  const response = await fetchBackend(`/spaces/${encodeURIComponent(spaceId)}`, {
    method: "DELETE",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend DELETE /spaces/${spaceId} unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (response.status === 404) {
    const err = new Error("Este espacio ya no existe.");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend DELETE /spaces failed with ${response.status}. ${body || "No body."}`);
  }
}

const minimalUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  publicCode: z.string(),
});

const taskAssigneeRowSchema = z.object({
  id: z.string(),
  userId: z.string(),
  assignedAt: z.string(),
  user: minimalUserSchema,
});

export const backendTaskDtoSchema = z.object({
  id: z.string(),
  spaceId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().nullable(),
  status: z.enum(["pending", "completed"]),
  computedStatus: z.enum(["completed", "expired", "pending"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().nullable(),
  createdByUser: minimalUserSchema,
  updatedByUser: minimalUserSchema,
  completedByUser: minimalUserSchema.nullable(),
  assignees: z.array(taskAssigneeRowSchema),
});

export type BackendTaskDto = z.infer<typeof backendTaskDtoSchema>;
export type BackendMinimalUserDto = z.infer<typeof minimalUserSchema>;

export const taskEventTypeSchema = z.enum([
  "task_created",
  "task_updated",
  "task_assigned",
  "task_unassigned",
  "task_completed",
  "task_reopened",
  "task_deleted",
]);

export const backendTaskEventDtoSchema = z.object({
  id: z.string(),
  type: taskEventTypeSchema,
  payload: z.unknown().nullable(),
  createdAt: z.string(),
  actor: minimalUserSchema,
});

export type BackendTaskEventDto = z.infer<typeof backendTaskEventDtoSchema>;

export type CreateBackendTaskBody = {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  assigneeUserIds?: string[];
};

export type PatchBackendTaskBody = {
  title?: string;
  description?: string | null;
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
};

function taskPath(spaceId: string, taskId?: string, suffix?: string): string {
  const base = `/spaces/${encodeURIComponent(spaceId)}/tasks`;
  if (!taskId) return base;
  const t = `${base}/${encodeURIComponent(taskId)}`;
  return suffix ? `${t}/${suffix}` : t;
}

async function parseTaskJson(response: Response): Promise<BackendTaskDto> {
  const raw = await response.json();
  return backendTaskDtoSchema.parse(raw);
}

function attachHttpStatus(err: Error, status: number): Error {
  (err as Error & { status: number }).status = status;
  return err;
}

export async function getBackendTasks(apiAccessToken: string, spaceId: string): Promise<BackendTaskDto[]> {
  const response = await fetchBackend(taskPath(spaceId), {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(
      new Error(`Backend GET /spaces/${spaceId}/tasks unauthorized (${response.status}).`),
      response.status,
    );
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Espacio no encontrado."), 404);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET /spaces/${spaceId}/tasks failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(backendTaskDtoSchema).parse(raw);
}

export async function getBackendTask(
  apiAccessToken: string,
  spaceId: string,
  taskId: string,
): Promise<BackendTaskDto> {
  const response = await fetchBackend(taskPath(spaceId, taskId), {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(
      new Error(`Backend GET task unauthorized (${response.status}).`),
      response.status,
    );
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Tarea no encontrada."), 404);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET task failed with ${response.status}. ${body || "No body."}`);
  }

  return parseTaskJson(response);
}

export async function createBackendTask(
  apiAccessToken: string,
  spaceId: string,
  body: CreateBackendTaskBody,
): Promise<BackendTaskDto> {
  const response = await fetchBackend(taskPath(spaceId), {
    method: "POST",
    apiAccessToken,
    body: JSON.stringify(body),
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(new Error(`Backend POST task unauthorized (${response.status}).`), response.status);
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Espacio no encontrado."), 404);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(text, `Error al crear tarea (${response.status}).`);
    const err = new Error(msg);
    throw attachHttpStatus(err, response.status);
  }

  const raw = await response.json();
  return backendTaskDtoSchema.parse(raw);
}

export async function patchBackendTask(
  apiAccessToken: string,
  spaceId: string,
  taskId: string,
  body: PatchBackendTaskBody,
): Promise<BackendTaskDto> {
  const response = await fetchBackend(taskPath(spaceId, taskId), {
    method: "PATCH",
    apiAccessToken,
    body: JSON.stringify(body),
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(new Error(`Backend PATCH task unauthorized (${response.status}).`), response.status);
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Tarea no encontrada."), 404);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(text, `Error al actualizar tarea (${response.status}).`);
    const err = new Error(msg);
    throw attachHttpStatus(err, response.status);
  }

  const raw = await response.json();
  return backendTaskDtoSchema.parse(raw);
}

export async function deleteBackendTask(apiAccessToken: string, spaceId: string, taskId: string): Promise<void> {
  const response = await fetchBackend(taskPath(spaceId, taskId), {
    method: "DELETE",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(new Error(`Backend DELETE task unauthorized (${response.status}).`), response.status);
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Tarea no encontrada."), 404);
  }

  if (response.status !== 204 && !response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend DELETE task failed with ${response.status}. ${body || "No body."}`);
  }
}

export async function completeBackendTask(
  apiAccessToken: string,
  spaceId: string,
  taskId: string,
): Promise<BackendTaskDto> {
  const response = await fetchBackend(taskPath(spaceId, taskId, "complete"), {
    method: "PATCH",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(new Error(`Backend complete task unauthorized (${response.status}).`), response.status);
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Tarea no encontrada."), 404);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(text, `Error al completar tarea (${response.status}).`);
    const err = new Error(msg);
    throw attachHttpStatus(err, response.status);
  }

  const raw = await response.json();
  return backendTaskDtoSchema.parse(raw);
}

export async function reopenBackendTask(
  apiAccessToken: string,
  spaceId: string,
  taskId: string,
): Promise<BackendTaskDto> {
  const response = await fetchBackend(taskPath(spaceId, taskId, "reopen"), {
    method: "PATCH",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(new Error(`Backend reopen task unauthorized (${response.status}).`), response.status);
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Tarea no encontrada."), 404);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(text, `Error al reabrir tarea (${response.status}).`);
    const err = new Error(msg);
    throw attachHttpStatus(err, response.status);
  }

  const raw = await response.json();
  return backendTaskDtoSchema.parse(raw);
}

export async function postBackendTaskAssignees(
  apiAccessToken: string,
  spaceId: string,
  taskId: string,
  userIds: string[],
): Promise<BackendTaskDto> {
  const response = await fetchBackend(taskPath(spaceId, taskId, "assignees"), {
    method: "POST",
    apiAccessToken,
    body: JSON.stringify({ userIds }),
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(
      new Error(`Backend POST assignees unauthorized (${response.status}).`),
      response.status,
    );
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Tarea no encontrada."), 404);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(text, `Error al asignar (${response.status}).`);
    const err = new Error(msg);
    throw attachHttpStatus(err, response.status);
  }

  const raw = await response.json();
  return backendTaskDtoSchema.parse(raw);
}

export async function deleteBackendTaskAssignee(
  apiAccessToken: string,
  spaceId: string,
  taskId: string,
  userId: string,
): Promise<BackendTaskDto> {
  const response = await fetchBackend(
    `${taskPath(spaceId, taskId, "assignees")}/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      apiAccessToken,
    },
  );

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(
      new Error(`Backend DELETE assignee unauthorized (${response.status}).`),
      response.status,
    );
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Asignación no encontrada."), 404);
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    const msg = messageFromNestErrorBody(text, `Error al desasignar (${response.status}).`);
    const err = new Error(msg);
    throw attachHttpStatus(err, response.status);
  }

  const raw = await response.json();
  return backendTaskDtoSchema.parse(raw);
}

export async function getBackendTaskEvents(
  apiAccessToken: string,
  spaceId: string,
  taskId: string,
): Promise<BackendTaskEventDto[]> {
  const response = await fetchBackend(`${taskPath(spaceId, taskId)}/events`, {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    throw attachHttpStatus(
      new Error(`Backend GET task events unauthorized (${response.status}).`),
      response.status,
    );
  }

  if (response.status === 404) {
    throw attachHttpStatus(new Error("Tarea no encontrada."), 404);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET task events failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(backendTaskEventDtoSchema).parse(raw);
}

const spaceMemberDtoSchema = z.object({
  userId: z.string(),
  name: z.string(),
  publicCode: z.string(),
  imageUrl: z.string().nullable(),
  role: z.enum(["owner", "member"]),
  joinedAt: z.string(),
});

export type BackendSpaceMemberDto = z.infer<typeof spaceMemberDtoSchema>;

export async function getBackendSpaceMembers(
  apiAccessToken: string,
  spaceId: string,
): Promise<BackendSpaceMemberDto[]> {
  const response = await fetchBackend(`/spaces/${encodeURIComponent(spaceId)}/members`, {
    method: "GET",
    apiAccessToken,
  });

  if (response.status === 401 || response.status === 403) {
    const err = new Error(`Backend GET /spaces/${spaceId}/members unauthorized (${response.status}).`);
    (err as Error & { status: number }).status = response.status;
    throw err;
  }

  if (response.status === 404) {
    const err = new Error("Espacio no encontrado.");
    (err as Error & { status: number }).status = 404;
    throw err;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Backend GET /spaces/${spaceId}/members failed with ${response.status}. ${body || "No body."}`);
  }

  const raw = await response.json();
  return z.array(spaceMemberDtoSchema).parse(raw);
}

const invitationStatusSchema = z.enum(["pending", "accepted", "rejected", "cancelled", "expired"]);

const simpleSpaceSchema = z.object({
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
  space: simpleSpaceSchema,
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
    spaceId: z.string(),
    invitedByUserId: z.string(),
    invitedUserId: z.string(),
    status: invitationStatusSchema,
    createdAt: z.string(),
    respondedAt: z.string().nullable(),
  })
  .passthrough();

export async function createBackendInvitation(
  apiAccessToken: string,
  spaceId: string,
  publicCode: string,
): Promise<z.infer<typeof invitationResponseSchema>> {
  const response = await fetchBackend(`/spaces/${encodeURIComponent(spaceId)}/invitations`, {
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
