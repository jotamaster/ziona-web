import type { Home } from "@/lib/homes/types";

/**
 * Utilidad server-side: primer hogar del GET /homes (orden `createdAt` desc en backend).
 * La UI autenticada usa además `SelectedHomeProvider` + localStorage cuando hay varios hogares.
 */
export function getActiveHome(homes: Home[]): Home | null {
  return homes[0] ?? null;
}
