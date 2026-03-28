import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { SelectedHomeProvider } from "@/components/homes/selected-home-context";
import { AuthenticatedShell } from "@/components/shell/authenticated-shell";
import { authOptions } from "@/lib/auth/auth-options";
import { getHomes } from "@/lib/homes/get-homes";
import { ROUTES } from "@/lib/routes";

export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(ROUTES.login);
  }

  const homes = await getHomes();

  const backendUser = session.backendUser;
  const user = {
    name: backendUser?.name ?? session.user?.name ?? "Usuario",
    email: backendUser?.email ?? session.user?.email,
    imageUrl: backendUser?.imageUrl ?? session.user?.image ?? null,
  };

  return (
    <SelectedHomeProvider homes={homes}>
      <AuthenticatedShell user={user}>{children}</AuthenticatedShell>
    </SelectedHomeProvider>
  );
}
