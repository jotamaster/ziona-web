import { CreateFirstHomeButton } from "@/components/homes/create-first-home-button";
import { NeuSurface } from "@/components/ui/neu-surface";

export default function HomesPage() {
  return (
    <NeuSurface variant="raised" className="p-6 sm:p-8">
      <h1 className="text-xl font-semibold text-[var(--neu-text)]">Hogares</h1>
      <p className="mt-2 text-pretty text-sm text-[var(--neu-text-muted)]">
        Aquí podrás ver y gestionar tus hogares cuando conectemos los datos.
      </p>
      <div className="flex justify-center mt-4">
        <CreateFirstHomeButton />
      </div>
      
    </NeuSurface>
  );
}
