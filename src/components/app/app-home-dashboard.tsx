"use client";

import Link from "next/link";

import { useSelectedHome } from "@/components/homes/selected-home-context";
import { HomeTasksSection } from "@/components/tasks/home-tasks-section";
import { NeuSurface } from "@/components/ui/neu-surface";
import { ROUTES } from "@/lib/routes";

export function AppHomeDashboard() {
  const { homes, selectedHome, hydrated } = useSelectedHome();
  const multiple = homes.length > 1;

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--neu-text)]">Inicio</h1>
        <p className="text-pretty text-sm text-[var(--neu-text-muted)]">
          {selectedHome ? (
            <>
              <span className="font-medium text-[var(--neu-text)]">{selectedHome.name}</span>.
              {multiple ? (
                <>
                  {" "}
                  Puedes cambiar de hogar con la flecha junto al nombre en la barra superior. El hogar activo es el
                  que usamos para las tareas de abajo.
                </>
              ) : (
                <> Este es tu hogar activo; puedes gestionar más hogares desde la sección Hogares.</>
              )}
            </>
          ) : hydrated ? (
            "Sin hogar seleccionado."
          ) : (
            "…"
          )}
        </p>
      </header>

      <HomeTasksSection />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.homes}
          className="neu-focus block rounded-[var(--neu-radius-md)] outline-offset-2 transition active:scale-[0.99]"
        >
          <NeuSurface variant="raised" className="h-full p-5 transition hover:brightness-[1.02]">
            <h2 className="font-semibold text-[var(--neu-text)]">Hogares</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--neu-text-muted)]">
              Ver la lista, crear hogares nuevos o eliminar los que creaste.
            </p>
          </NeuSurface>
        </Link>
        <Link
          href={ROUTES.invitations}
          className="neu-focus block rounded-[var(--neu-radius-md)] outline-offset-2 transition active:scale-[0.99]"
        >
          <NeuSurface variant="raised" className="h-full p-5 transition hover:brightness-[1.02]">
            <h2 className="font-semibold text-[var(--neu-text)]">Invitaciones</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--neu-text-muted)]">
              Revisa invitaciones pendientes y gestiona accesos a tus espacios.
            </p>
          </NeuSurface>
        </Link>
      </div>
    </div>
  );
}
