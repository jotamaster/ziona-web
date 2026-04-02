import { getServerSession } from "next-auth";

import { CreateSpaceButton } from "@/components/spaces/create-space-button";
import { EmptySpacesState } from "@/components/spaces/empty-spaces-state";
import { SpacesList } from "@/components/spaces/spaces-list";
import { authOptions } from "@/lib/auth/auth-options";
import { getSpaces } from "@/lib/spaces/get-spaces";

export default async function SpacesPage() {
  const [spaces, session] = await Promise.all([getSpaces(), getServerSession(authOptions)]);
  const currentUserId = session?.backendUser?.id ?? null;

  if (spaces.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-2">
        <EmptySpacesState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--neu-text)]">Tus espacios</h1>
        <CreateSpaceButton variant="inline" label="Añadir espacio" />
      </div>
      <SpacesList spaces={spaces} currentUserId={currentUserId} />
    </div>
  );
}
