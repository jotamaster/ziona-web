"use client";

import { useRouter } from "next/navigation";

import { useSelectedSpace } from "@/components/spaces/selected-space-context";
import type { Space } from "@/lib/spaces/types";
import { ROUTES } from "@/lib/routes";

import { SpaceCard } from "./space-card";

type SpacesListProps = {
  spaces: Space[];
  currentUserId: string | null;
};

export function SpacesList({ spaces, currentUserId }: SpacesListProps) {
  const router = useRouter();
  const { selectedSpaceId, setSelectedSpaceId, spaces: ctxSpaces } = useSelectedSpace();
  const showUseActive = ctxSpaces.length > 1;

  return (
    <ul className="flex flex-col gap-3">
      {spaces.map((space) => {
        const isActive = space.id === selectedSpaceId;
        const canDelete =
          currentUserId !== null &&
          space.createdByUserId !== undefined &&
          space.createdByUserId === currentUserId;
        const onUseAsActive =
          showUseActive && !isActive
            ? () => {
                setSelectedSpaceId(space.id);
                router.push(ROUTES.app);
                router.refresh();
              }
            : undefined;
        return (
          <li key={space.id}>
            <SpaceCard space={space} isActive={isActive} canDelete={canDelete} onUseAsActive={onUseAsActive} />
          </li>
        );
      })}
    </ul>
  );
}
