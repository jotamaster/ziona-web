import type { Home } from "@/lib/homes/types";

/**
 * El hogar activo es el primer elemento del array. Si no hay elementos, no hay activo.
 */
export function getActiveHome(homes: Home[]): Home | null {
  return homes[0] ?? null;
}
