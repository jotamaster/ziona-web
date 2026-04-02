import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { SelectedSpaceProvider } from "@/components/spaces/selected-space-context";
import { AuthenticatedShell } from "@/components/shell/authenticated-shell";
import { authOptions } from "@/lib/auth/auth-options";
import { getSpaces } from "@/lib/spaces/get-spaces";
import { ROUTES } from "@/lib/routes";

export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(ROUTES.login);
  }

  const spaces = await getSpaces();

  const backendUser = session.backendUser;
  const user = {
    publicCode: backendUser?.publicCode ?? null,
    name: backendUser?.name ?? session.user?.name ?? "Usuario",
    email: backendUser?.email ?? session.user?.email,
    imageUrl: backendUser?.imageUrl ?? session.user?.image ?? null,
  };

  return (
    <SelectedSpaceProvider spaces={spaces}>
      <AuthenticatedShell user={user}>{children}</AuthenticatedShell>
    </SelectedSpaceProvider>
  );
}
