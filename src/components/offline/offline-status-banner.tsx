"use client";

type OfflineStatusBannerProps = {
  networkOffline: boolean;
  fromCache: boolean;
  pendingSyncCount: number;
};

export function OfflineStatusBanner({
  networkOffline,
  fromCache,
  pendingSyncCount,
}: OfflineStatusBannerProps) {
  if (!networkOffline && !fromCache && pendingSyncCount === 0) {
    return null;
  }

  const parts: string[] = [];
  if (networkOffline) {
    parts.push("Sin conexión");
  }
  if (fromCache && !networkOffline) {
    parts.push("Datos desde copia local");
  }
  if (pendingSyncCount > 0) {
    parts.push(
      pendingSyncCount === 1
        ? "1 cambio pendiente de sincronizar"
        : `${pendingSyncCount} cambios pendientes de sincronizar`,
    );
  }

  return (
    <div
      role="status"
      className="mb-4 rounded-[var(--neu-radius-sm)] border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-950 dark:text-amber-100"
    >
      {parts.join(" · ")}
    </div>
  );
}
