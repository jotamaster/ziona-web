import { EmptyHomesState } from "@/components/homes/empty-homes-state";
import { NeuSurface } from "@/components/ui/neu-surface";
import { getStubHomes } from "@/lib/homes/stub-homes";

export default async function AppHomePage() {
  const homes = getStubHomes();

  if (homes.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-2">
        <EmptyHomesState />
      </div>
    );
  }

  return (
    <NeuSurface variant="raised" className="p-6 sm:p-8">
      <h1 className="text-xl font-semibold text-[var(--neu-text)]">Inicio</h1>
      <p className="mt-2 text-pretty text-sm text-[var(--neu-text-muted)]">
        Tu espacio principal en Ziona.
      </p>
    </NeuSurface>
  );
}
