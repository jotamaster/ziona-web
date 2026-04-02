import type { Space } from "@/lib/spaces/types";

/**
 * Utilidad server-side: primer espacio del GET /spaces (orden `createdAt` desc en backend).
 * La UI autenticada usa además `SelectedSpaceProvider` + localStorage cuando hay varios espacios.
 */
export function getActiveSpace(spaces: Space[]): Space | null {
  return spaces[0] ?? null;
}
