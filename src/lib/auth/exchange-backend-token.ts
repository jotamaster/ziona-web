import { z } from "zod";

const exchangePayloadSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  imageUrl: z.string().url().max(2048).optional(),
  googleSub: z.string().min(1).max(255),
});

const exchangeResponseSchema = z.object({
  accessToken: z.string().min(1),
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().min(1),
    imageUrl: z.string().nullable(),
    publicCode: z.string().min(1),
    googleSub: z.string().nullable(),
  }),
});

export type ExchangeAuthResponse = z.infer<typeof exchangeResponseSchema>;

function getApiBaseUrl(): string {
  const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "Missing API_BASE_URL (or NEXT_PUBLIC_API_BASE_URL) env variable for backend exchange.",
    );
  }
  return baseUrl.replace(/\/+$/, "");
}

export async function exchangeBackendToken(input: {
  email: string;
  name: string;
  imageUrl?: string;
  googleSub: string;
}): Promise<ExchangeAuthResponse> {
  const payload = exchangePayloadSchema.parse({
    email: input.email,
    name: input.name,
    imageUrl: input.imageUrl,
    googleSub: input.googleSub,
  });

  const timeout = Number(process.env.AUTH_EXCHANGE_TIMEOUT_MS ?? 7000);
  const signal = AbortSignal.timeout(Number.isFinite(timeout) ? timeout : 7000);

  const response = await fetch(`${getApiBaseUrl()}/auth/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Backend /auth/exchange failed with ${response.status}. ${body || "No response body."}`,
    );
  }

  const raw = await response.json();
  return exchangeResponseSchema.parse(raw);
}
