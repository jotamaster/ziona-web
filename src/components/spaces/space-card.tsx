"use client";

import Link from "next/link";

import { NeuSurface } from "@/components/ui/neu-surface";
import type { Space } from "@/lib/spaces/types";
import { routeSpaceAdmin } from "@/lib/routes";

import { ActiveSpaceBadge } from "./active-space-badge";
import { SpaceDeleteButton } from "./space-delete-button";

type SpaceCardProps = {
  space: Space;
  isActive: boolean;
  canDelete: boolean;
  /** Si está definido, muestra acción para marcar este espacio como activo (varios espacios). */
  onUseAsActive?: () => void;
};

export function SpaceCard({ space, isActive, canDelete, onUseAsActive }: SpaceCardProps) {
  return (
    <NeuSurface variant="raised" className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isActive ? <ActiveSpaceBadge /> : null}
            <p className="min-w-0 font-medium text-[var(--neu-text)]">{space.name}</p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href={routeSpaceAdmin(space.id)}
              className="neu-focus text-sm font-medium text-[var(--neu-accent)] transition hover:underline"
            >
              Administrar
            </Link>
            {onUseAsActive ? (
              <button
                type="button"
                className="neu-focus text-left text-sm font-medium text-[var(--neu-accent)] transition hover:underline"
                onClick={onUseAsActive}
              >
                Usar como espacio activo
              </button>
            ) : null}
          </div>
        </div>
        {canDelete ? (
          <div className="shrink-0 self-start sm:self-center">
            <SpaceDeleteButton space={space} isActive={isActive} />
          </div>
        ) : null}
      </div>
    </NeuSurface>
  );
}
