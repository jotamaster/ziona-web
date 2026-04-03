import type { CreateBackendTaskBody, PatchBackendTaskBody } from "@/lib/api/backend-client";

/** Cola de sincronización: `taskId` en create es el id temporal hasta que el servidor devuelve el real (mapa en snapshots). */
export type OutboxRow =
  | { op: "create"; spaceId: string; taskId: string; body: CreateBackendTaskBody }
  | { op: "update"; spaceId: string; taskId: string; body: PatchBackendTaskBody }
  | { op: "delete"; spaceId: string; taskId: string }
  | { op: "complete"; spaceId: string; taskId: string }
  | { op: "reopen"; spaceId: string; taskId: string }
  | { op: "assign"; spaceId: string; taskId: string; userIds: string[] }
  | { op: "unassign"; spaceId: string; taskId: string; userId: string };
