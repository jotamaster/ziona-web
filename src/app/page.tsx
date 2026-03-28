import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/auth/login-screen";
import { authOptions } from "@/lib/auth/auth-options";
import { ROUTES } from "@/lib/routes";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect(ROUTES.app);
  }

  return <LoginScreen />;
}
