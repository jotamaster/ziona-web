import type { Space } from "@/lib/spaces/types";

export const SELECTED_SPACE_STORAGE_KEY = "ziona:activeSpaceId";

const LEGACY_SELECTED_HOME_STORAGE_KEY = "ziona:activeHomeId";

function migrateLegacyStorageOnce(): void {
  if (typeof window === "undefined") return;
  try {
    const current = localStorage.getItem(SELECTED_SPACE_STORAGE_KEY)?.trim();
    if (current) return;
    const legacy = localStorage.getItem(LEGACY_SELECTED_HOME_STORAGE_KEY)?.trim();
    if (legacy) {
      localStorage.setItem(SELECTED_SPACE_STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_SELECTED_HOME_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Determina qué id de espacio debe considerarse seleccionado según la lista actual y un valor persistido.
 * - 0 espacios: null
 * - 1 espacio: siempre ese id
 * - 2+: usar storedId si sigue en la lista; si no, fallback a spaces[0]
 */
export function resolveSelectedSpaceId(spaces: Space[], storedId: string | null): string | null {
  if (spaces.length === 0) return null;
  if (spaces.length === 1) return spaces[0].id;
  if (storedId && spaces.some((s) => s.id === storedId)) return storedId;
  return spaces[0].id;
}

export function readSelectedSpaceIdFromStorage(): string | null {
  migrateLegacyStorageOnce();
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(SELECTED_SPACE_STORAGE_KEY);
    const t = v?.trim();
    return t || null;
  } catch {
    return null;
  }
}

export function writeSelectedSpaceIdToStorage(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id == null) {
      localStorage.removeItem(SELECTED_SPACE_STORAGE_KEY);
      localStorage.removeItem(LEGACY_SELECTED_HOME_STORAGE_KEY);
    } else {
      localStorage.setItem(SELECTED_SPACE_STORAGE_KEY, id);
      localStorage.removeItem(LEGACY_SELECTED_HOME_STORAGE_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}
