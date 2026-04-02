import { CreateSpaceButton } from "@/components/spaces/create-space-button";
import { NeuSurface } from "@/components/ui/neu-surface";

type EmptySpacesStateProps = {
  className?: string;
};

export function EmptySpacesState({ className = "" }: EmptySpacesStateProps) {
  return (
    <NeuSurface
      variant="raised"
      className={`mx-auto flex w-full max-w-md flex-col items-center gap-6 px-8 py-10 text-center ${className}`.trim()}
    >
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-[var(--neu-text)]">
          Aún no tienes espacios
        </h2>
        <p className="text-pretty text-sm leading-relaxed text-[var(--neu-text-muted)]">
          Crea tu primer espacio para organizar tareas e invitar a quien quieras. El espacio más reciente se muestra
          como activo en la barra superior.
        </p>
      </div>
      <CreateSpaceButton variant="primary" label="Crear tu primer espacio" />
    </NeuSurface>
  );
}
