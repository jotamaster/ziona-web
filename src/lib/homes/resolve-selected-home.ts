import type { Home } from "@/lib/homes/types";

export const SELECTED_HOME_STORAGE_KEY = "ziona:activeHomeId";

/**
 * Determina qué id de hogar debe considerarse seleccionado según la lista actual y un valor persistido.
 * - 0 hogares: null
 * - 1 hogar: siempre ese id
 * - 2+: usar storedId si sigue en la lista; si no, fallback a homes[0]
 */
export function resolveSelectedHomeId(homes: Home[], storedId: string | null): string | null {
  if (homes.length === 0) return null;
  if (homes.length === 1) return homes[0].id;
  if (storedId && homes.some((h) => h.id === storedId)) return storedId;
  return homes[0].id;
}

export function readSelectedHomeIdFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(SELECTED_HOME_STORAGE_KEY);
    const t = v?.trim();
    return t || null;
  } catch {
    return null;
  }
}

export function writeSelectedHomeIdToStorage(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id == null) localStorage.removeItem(SELECTED_HOME_STORAGE_KEY);
    else localStorage.setItem(SELECTED_HOME_STORAGE_KEY, id);
  } catch {
    /* ignore quota / private mode */
  }
}
