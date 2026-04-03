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
import { loadCachedSpaces, saveSpacesCache } from "@/lib/offline/snapshots";

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
  const [cachedSpaces, setCachedSpaces] = useState<Space[]>([]);

  const effectiveSpaces = useMemo(
    () => (spaces.length > 0 ? spaces : cachedSpaces),
    [spaces, cachedSpaces],
  );

  const [selectedSpaceId, setSelectedSpaceIdState] = useState<string | null>(() =>
    effectiveSpaces.length === 0 ? null : effectiveSpaces[0]?.id ?? null,
  );
  const [hydrated, setHydrated] = useState(false);

  const spacesKey = useMemo(() => effectiveSpaces.map((s) => s.id).join(","), [effectiveSpaces]);

  useEffect(() => {
    if (spaces.length > 0) {
      void saveSpacesCache(spaces);
      setCachedSpaces([]);
      return;
    }
    let cancelled = false;
    void loadCachedSpaces().then((c) => {
      if (!cancelled && c.length > 0) setCachedSpaces(c);
    });
    return () => {
      cancelled = true;
    };
  }, [spaces]);

  useEffect(() => {
    const stored = readSelectedSpaceIdFromStorage();
    const next = resolveSelectedSpaceId(effectiveSpaces, stored);
    setSelectedSpaceIdState(next);
    writeSelectedSpaceIdToStorage(next);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [spacesKey]);

  const setSelectedSpaceId = useCallback(
    (id: string) => {
      if (!effectiveSpaces.some((s) => s.id === id)) return;
      setSelectedSpaceIdState(id);
      writeSelectedSpaceIdToStorage(id);
    },
    [effectiveSpaces],
  );

  const selectedSpace = useMemo(() => {
    if (selectedSpaceId == null) return null;
    return effectiveSpaces.find((s) => s.id === selectedSpaceId) ?? null;
  }, [effectiveSpaces, selectedSpaceId]);

  const value = useMemo(
    () => ({
      spaces: effectiveSpaces,
      selectedSpaceId,
      selectedSpace,
      hydrated,
      setSelectedSpaceId,
    }),
    [effectiveSpaces, selectedSpaceId, selectedSpace, hydrated, setSelectedSpaceId],
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
