"use client";

import { NeuSurface } from "@/components/ui/neu-surface";
import type { Home } from "@/lib/homes/types";

import { ActiveHomeBadge } from "./active-home-badge";
import { HomeDeleteButton } from "./home-delete-button";

type HomeCardProps = {
  home: Home;
  isActive: boolean;
  canDelete: boolean;
  /** Si está definido, muestra acción para marcar este hogar como activo (varios hogares). */
  onUseAsActive?: () => void;
};

export function HomeCard({ home, isActive, canDelete, onUseAsActive }: HomeCardProps) {
  return (
    <NeuSurface variant="raised" className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isActive ? <ActiveHomeBadge /> : null}
            <p className="min-w-0 font-medium text-[var(--neu-text)]">{home.name}</p>
          </div>
          {onUseAsActive ? (
            <button
              type="button"
              className="neu-focus mt-2 text-left text-sm font-medium text-[var(--neu-accent)] transition hover:underline"
              onClick={onUseAsActive}
            >
              Usar como hogar activo
            </button>
          ) : null}
        </div>
        {canDelete ? (
          <div className="shrink-0 self-start sm:self-center">
            <HomeDeleteButton home={home} isActive={isActive} />
          </div>
        ) : null}
      </div>
    </NeuSurface>
  );
}
