import { getToken } from "next-auth/jwt";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

function authSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

/**
 * Lee el JWT de NextAuth desde las cookies y devuelve el access token del backend.
 * Solo para uso en Server Components / Server Actions (no exponer al cliente).
 */
export async function getApiAccessTokenFromCookies(): Promise<string | null> {
  const secret = authSecret();
  if (!secret) {
    return null;
  }

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const req = new NextRequest("http://localhost", {
    headers: { cookie: cookieHeader },
  });

  const token = await getToken({
    secret,
    req,
  });

  return typeof token?.apiAccessToken === "string" ? token.apiAccessToken : null;
}
