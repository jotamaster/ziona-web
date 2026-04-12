"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Space } from "@/lib/spaces/types";
import {
  readSelectedSpaceIdFromStorage,
  resolveSelectedSpaceId,
  writeSelectedSpaceIdToStorage,
} from "@/lib/spaces/resolve-selected-space";

type SelectedSpaceContextValue = {
  spaces: Space[];
  selectedSpaceId: string | null;
  selectedSpace: Space | null;
  /** True después de aplicar localStorage al montar o al actualizar spaces. */
  hydrated: boolean;
  setSelectedSpaceId: (id: string) => void;
};

const SelectedSpaceContext = createContext<SelectedSpaceContextValue | null>(null);

type SelectedSpaceProviderProps = {
  spaces: Space[];
  children: ReactNode;
};

export function SelectedSpaceProvider({ spaces, children }: SelectedSpaceProviderProps) {
  const [selectedSpaceId, setSelectedSpaceIdState] = useState<string | null>(() =>
    spaces.length === 0 ? null : spaces[0]?.id ?? null,
  );
  const [hydrated, setHydrated] = useState(false);

  const spacesKey = useMemo(() => spaces.map((s) => s.id).join(","), [spaces]);

  useEffect(() => {
    const stored = readSelectedSpaceIdFromStorage();
    const next = resolveSelectedSpaceId(spaces, stored);
    setSelectedSpaceIdState(next);
    writeSelectedSpaceIdToStorage(next);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [spacesKey]);

  const setSelectedSpaceId = useCallback(
    (id: string) => {
      if (!spaces.some((s) => s.id === id)) return;
      setSelectedSpaceIdState(id);
      writeSelectedSpaceIdToStorage(id);
    },
    [spaces],
  );

  const selectedSpace = useMemo(() => {
    if (selectedSpaceId == null) return null;
    return spaces.find((s) => s.id === selectedSpaceId) ?? null;
  }, [spaces, selectedSpaceId]);

  const value = useMemo(
    () => ({
      spaces,
      selectedSpaceId,
      selectedSpace,
      hydrated,
      setSelectedSpaceId,
    }),
    [spaces, selectedSpaceId, selectedSpace, hydrated, setSelectedSpaceId],
  );

  return <SelectedSpaceContext.Provider value={value}>{children}</SelectedSpaceContext.Provider>;
}

export function useSelectedSpace(): SelectedSpaceContextValue {
  const ctx = useContext(SelectedSpaceContext);
  if (!ctx) {
    throw new Error("useSelectedSpace must be used within SelectedSpaceProvider");
  }
  return ctx;
}
