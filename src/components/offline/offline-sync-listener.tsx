"use client";

import { useEffect } from "react";

import { flushOutbox } from "@/lib/offline/sync-outbox";

/**
 * Vacía la cola al volver la conexión y notifica a quien escuche `ziona-offline-sync`.
 */
export function OfflineSyncListener() {
  useEffect(() => {
    const run = async () => {
      await flushOutbox();
      window.dispatchEvent(new CustomEvent("ziona-offline-sync"));
    };
    void run();
    const onOnline = () => {
      void run();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return null;
}
