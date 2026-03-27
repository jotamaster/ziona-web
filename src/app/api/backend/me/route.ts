import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

import { getBackendMe } from "@/lib/api/backend-client";

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  if (!token?.apiAccessToken || typeof token.apiAccessToken !== "string") {
    return NextResponse.json(
      { message: "No backend apiAccessToken in current session." },
      { status: 401 },
    );
  }

  try {
    const me = await getBackendMe(token.apiAccessToken);
    return NextResponse.json(me);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown backend error.";
    return NextResponse.json({ message }, { status: 502 });
  }
}
