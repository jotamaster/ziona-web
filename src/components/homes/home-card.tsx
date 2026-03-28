"use client";

import Link from "next/link";

import { NeuSurface } from "@/components/ui/neu-surface";
import type { Home } from "@/lib/homes/types";
import { routeHomeAdmin } from "@/lib/routes";

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
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              href={routeHomeAdmin(home.id)}
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
                Usar como hogar activo
              </button>
            ) : null}
          </div>
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
