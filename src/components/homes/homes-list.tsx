"use client";

import { useRouter } from "next/navigation";

import { useSelectedHome } from "@/components/homes/selected-home-context";
import type { Home } from "@/lib/homes/types";
import { ROUTES } from "@/lib/routes";

import { HomeCard } from "./home-card";

type HomesListProps = {
  homes: Home[];
  currentUserId: string | null;
};

export function HomesList({ homes, currentUserId }: HomesListProps) {
  const router = useRouter();
  const { selectedHomeId, setSelectedHomeId, homes: ctxHomes } = useSelectedHome();
  const showUseActive = ctxHomes.length > 1;

  return (
    <ul className="flex flex-col gap-3">
      {homes.map((home) => {
        const isActive = home.id === selectedHomeId;
        const canDelete =
          currentUserId !== null &&
          home.createdByUserId !== undefined &&
          home.createdByUserId === currentUserId;
        const onUseAsActive =
          showUseActive && !isActive
            ? () => {
                setSelectedHomeId(home.id);
                router.push(ROUTES.app);
                router.refresh();
              }
            : undefined;
        return (
          <li key={home.id}>
            <HomeCard home={home} isActive={isActive} canDelete={canDelete} onUseAsActive={onUseAsActive} />
          </li>
        );
      })}
    </ul>
  );
}
