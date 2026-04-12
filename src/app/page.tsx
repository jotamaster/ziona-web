import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/auth/login-screen";
import { authOptions } from "@/lib/auth/auth-options";
import { getApiAccessTokenFromCookies } from "@/lib/auth/get-api-access-token";
import { ROUTES } from "@/lib/routes";

export default async function Home() {
  const [session, apiAccessToken] = await Promise.all([
    getServerSession(authOptions),
    getApiAccessTokenFromCookies(),
  ]);
  // Same gate as getSpaces(): JWT must expose apiAccessToken via getToken().
  // Using only session.hasApiAccessToken can disagree with getToken() → / ↔ /app loop.
  if (session && apiAccessToken) {
    redirect(ROUTES.app);
  }

  return <LoginScreen />;
}
