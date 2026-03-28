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

import type { Home } from "@/lib/homes/types";
import {
  readSelectedHomeIdFromStorage,
  resolveSelectedHomeId,
  writeSelectedHomeIdToStorage,
} from "@/lib/homes/resolve-selected-home";

type SelectedHomeContextValue = {
  homes: Home[];
  selectedHomeId: string | null;
  selectedHome: Home | null;
  /** True después de aplicar localStorage al montar o al actualizar homes. */
  hydrated: boolean;
  setSelectedHomeId: (id: string) => void;
};

const SelectedHomeContext = createContext<SelectedHomeContextValue | null>(null);

type SelectedHomeProviderProps = {
  homes: Home[];
  children: ReactNode;
};

export function SelectedHomeProvider({ homes, children }: SelectedHomeProviderProps) {
  const [selectedHomeId, setSelectedHomeIdState] = useState<string | null>(() =>
    homes.length === 0 ? null : homes[0]?.id ?? null,
  );
  const [hydrated, setHydrated] = useState(false);

  const homesKey = useMemo(() => homes.map((h) => h.id).join(","), [homes]);

  useEffect(() => {
    const stored = readSelectedHomeIdFromStorage();
    const next = resolveSelectedHomeId(homes, stored);
    setSelectedHomeIdState(next);
    writeSelectedHomeIdToStorage(next);
    setHydrated(true);
    // homesKey refleja el conjunto de ids; evita re-ejecutar en cada nueva referencia de array.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [homesKey]);

  const setSelectedHomeId = useCallback((id: string) => {
    if (!homes.some((h) => h.id === id)) return;
    setSelectedHomeIdState(id);
    writeSelectedHomeIdToStorage(id);
  }, [homes]);

  const selectedHome = useMemo(() => {
    if (selectedHomeId == null) return null;
    return homes.find((h) => h.id === selectedHomeId) ?? null;
  }, [homes, selectedHomeId]);

  const value = useMemo(
    () => ({
      homes,
      selectedHomeId,
      selectedHome,
      hydrated,
      setSelectedHomeId,
    }),
    [homes, selectedHomeId, selectedHome, hydrated, setSelectedHomeId],
  );

  return <SelectedHomeContext.Provider value={value}>{children}</SelectedHomeContext.Provider>;
}

export function useSelectedHome(): SelectedHomeContextValue {
  const ctx = useContext(SelectedHomeContext);
  if (!ctx) {
    throw new Error("useSelectedHome must be used within SelectedHomeProvider");
  }
  return ctx;
}
