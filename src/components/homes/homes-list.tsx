import type { Home } from "@/lib/homes/types";

import { HomeCard } from "./home-card";

type HomesListProps = {
  homes: Home[];
  currentUserId: string | null;
};

export function HomesList({ homes, currentUserId }: HomesListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {homes.map((home, index) => {
        const isActive = index === 0;
        const canDelete =
          currentUserId !== null &&
          home.createdByUserId !== undefined &&
          home.createdByUserId === currentUserId;
        return (
          <li key={home.id}>
            <HomeCard home={home} isActive={isActive} canDelete={canDelete} />
          </li>
        );
      })}
    </ul>
  );
}
