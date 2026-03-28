import { NeuSurface } from "@/components/ui/neu-surface";
import type { Home } from "@/lib/homes/types";

import { ActiveHomeBadge } from "./active-home-badge";
import { HomeDeleteButton } from "./home-delete-button";

type HomeCardProps = {
  home: Home;
  isActive: boolean;
  canDelete: boolean;
};

export function HomeCard({ home, isActive, canDelete }: HomeCardProps) {
  return (
    <NeuSurface variant="raised" className="px-5 py-4">
      <div className="flex gap-3 sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isActive ? <ActiveHomeBadge /> : null}
            <p className="min-w-0 font-medium text-[var(--neu-text)]">{home.name}</p>
          </div>
        </div>
        {canDelete ? (
          <div className="shrink-0 self-start sm:self-center">
            <HomeDeleteButton home={home} />
          </div>
        ) : null}
      </div>
    </NeuSurface>
  );
}
