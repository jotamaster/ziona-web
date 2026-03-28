import { getServerSession } from "next-auth";

import { CreateHomeButton } from "@/components/homes/create-home-button";
import { EmptyHomesState } from "@/components/homes/empty-homes-state";
import { HomesList } from "@/components/homes/homes-list";
import { authOptions } from "@/lib/auth/auth-options";
import { getHomes } from "@/lib/homes/get-homes";

export default async function HomesPage() {
  const [homes, session] = await Promise.all([getHomes(), getServerSession(authOptions)]);
  const currentUserId = session?.backendUser?.id ?? null;

  if (homes.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-2">
        <EmptyHomesState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--neu-text)]">Tus hogares</h1>
        <CreateHomeButton variant="inline" label="Añadir hogar" />
      </div>
      <HomesList homes={homes} currentUserId={currentUserId} />
    </div>
  );
}
