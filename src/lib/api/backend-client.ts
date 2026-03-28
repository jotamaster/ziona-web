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
