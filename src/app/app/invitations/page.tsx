import { NeuSurface } from "@/components/ui/neu-surface";

export default function InvitationsPage() {
  return (
    <NeuSurface variant="raised" className="p-6 sm:p-8">
      <h1 className="text-xl font-semibold text-[var(--neu-text)]">Invitaciones</h1>
      <p className="mt-2 text-pretty text-sm text-[var(--neu-text-muted)]">
        Aquí aparecerán las invitaciones pendientes cuando integremos el backend.
      </p>
    </NeuSurface>
  );
}
