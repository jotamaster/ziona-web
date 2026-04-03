"use client";

import Link from "next/link";

import { SpaceMembersStrip } from "@/components/app/space-members-strip";
import { SpaceTaskStatsRow } from "@/components/app/space-task-stats-row";
import { useSpaceDashboardData } from "@/components/app/use-space-dashboard-data";
import { OfflineStatusBanner } from "@/components/offline/offline-status-banner";
import { useSelectedSpace } from "@/components/spaces/selected-space-context";
import { SpaceTasksSection } from "@/components/tasks/space-tasks-section";
import { NeuSurface } from "@/components/ui/neu-surface";
import { ROUTES } from "@/lib/routes";

export function AppSpaceDashboard() {
  const { selectedSpace, selectedSpaceId } = useSelectedSpace();
  const dash = useSpaceDashboardData(selectedSpaceId);

  return (
    <div className="flex flex-col gap-8">
      {selectedSpace && selectedSpaceId ? (
        <div className="flex flex-col gap-5">
          <OfflineStatusBanner
            networkOffline={dash.networkOffline}
            fromCache={dash.fromCache}
            pendingSyncCount={dash.pendingSyncCount}
          />
          <SpaceMembersStrip
            members={dash.members}
            loading={dash.membersLoading}
            error={dash.membersError}
          />
          <SpaceTaskStatsRow
            tasks={dash.tasks}
            loading={dash.tasksLoading}
            error={dash.tasksError}
          />
          <SpaceTasksSection
            spaceId={selectedSpaceId}
            spaceName={selectedSpace.name}
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
          href={ROUTES.spaces}
          className="neu-focus block rounded-[var(--neu-radius-md)] outline-offset-2 transition active:scale-[0.99]"
        >
          <NeuSurface variant="raised" className="h-full p-5 transition hover:brightness-[1.02]">
            <h2 className="font-semibold text-[var(--neu-text)]">Espacios</h2>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-[var(--neu-text-muted)]">
              Ver la lista, crear espacios nuevos o eliminar los que creaste.
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
