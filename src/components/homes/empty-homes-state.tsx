import { CreateFirstHomeButton } from "@/components/homes/create-first-home-button";
import { NeuSurface } from "@/components/ui/neu-surface";

type EmptyHomesStateProps = {
  className?: string;
};

export function EmptyHomesState({ className = "" }: EmptyHomesStateProps) {
  return (
    <NeuSurface
      variant="raised"
      className={`mx-auto flex w-full max-w-md flex-col items-center gap-6 px-8 py-10 text-center ${className}`.trim()}
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--neu-text)]">
          Aún no tienes hogares
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-[var(--neu-text-muted)]">
          Crea tu primer hogar para organizar tu espacio y empezar a invitar a quien quieras.
        </p>
      </div>
      <CreateFirstHomeButton />
    </NeuSurface>
  );
}
