"use client";

import Link from "next/link";

import { HomeMembersStrip } from "@/components/app/home-members-strip";
import { HomeTaskStatsRow } from "@/components/app/home-task-stats-row";
import { useHomeDashboardData } from "@/components/app/use-home-dashboard-data";
import { useSelectedHome } from "@/components/homes/selected-home-context";
import { HomeTasksSection } from "@/components/tasks/home-tasks-section";
import { NeuSurface } from "@/components/ui/neu-surface";
import { ROUTES } from "@/lib/routes";

export function AppHomeDashboard() {
  const { selectedHome, selectedHomeId } = useSelectedHome();
  const dash = useHomeDashboardData(selectedHomeId);

  return (
    <div className="flex flex-col gap-8">

      {selectedHome && selectedHomeId ? (
        <div className="flex flex-col gap-5">
          <HomeMembersStrip
            members={dash.members}
            loading={dash.membersLoading}
            error={dash.membersError}
          />
          <HomeTaskStatsRow
            tasks={dash.tasks}
            loading={dash.tasksLoading}
            error={dash.tasksError}
          />
          <HomeTasksSection
            homeId={selectedHomeId}
            homeName={selectedHome.name}
            tasks={dash.tasks}
            loading={dash.tasksLoading}
            error={dash.tasksError}
            members={dash.members}
            onTasksMutated={dash.refetch}
          />
        </div>
      ) : null}

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
