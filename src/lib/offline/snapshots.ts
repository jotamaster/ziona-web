import type { BackendSpaceMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import type { Space } from "@/lib/spaces/types";

import { kvGet, kvSet } from "./idb";

const KEY_SPACES = "spaces:list";
const KEY_TEMP_MAP = "tempTaskIdMap";

function snapshotKey(spaceId: string): string {
  return `snapshot:${spaceId}`;
}

export type SpaceSnapshot = {
  tasks: BackendTaskDto[];
  members: BackendSpaceMemberDto[];
  updatedAt: number;
};

export async function loadCachedSpaces(): Promise<Space[]> {
  const v = await kvGet<Space[]>(KEY_SPACES);
  return Array.isArray(v) ? v : [];
}

export async function saveSpacesCache(spaces: Space[]): Promise<void> {
  await kvSet(KEY_SPACES, spaces);
}

export async function loadSpaceSnapshot(spaceId: string): Promise<SpaceSnapshot | null> {
  const v = await kvGet<SpaceSnapshot>(snapshotKey(spaceId));
  if (!v || !Array.isArray(v.tasks)) return null;
  return {
    ...v,
    members: Array.isArray(v.members) ? v.members : [],
  };
}

export async function saveSpaceSnapshot(
  spaceId: string,
  partial: Pick<SpaceSnapshot, "tasks" | "members">,
): Promise<void> {
  const next: SpaceSnapshot = {
    tasks: partial.tasks,
    members: partial.members,
    updatedAt: Date.now(),
  };
  await kvSet(snapshotKey(spaceId), next);
}

export async function patchSpaceSnapshot(
  spaceId: string,
  fn: (prev: SpaceSnapshot | null) => SpaceSnapshot,
): Promise<void> {
  const prev = await loadSpaceSnapshot(spaceId);
  const next = fn(prev);
  await kvSet(snapshotKey(spaceId), next);
}

export async function getTempIdMap(): Promise<Record<string, string>> {
  const v = await kvGet<Record<string, string>>(KEY_TEMP_MAP);
  return v && typeof v === "object" ? { ...v } : {};
}

export async function setTempIdMap(map: Record<string, string>): Promise<void> {
  await kvSet(KEY_TEMP_MAP, map);
}

export async function remapTaskIdEverywhere(spaceId: string, tempId: string, realId: string): Promise<void> {
  const map = await getTempIdMap();
  map[tempId] = realId;
  await setTempIdMap(map);

  await patchSpaceSnapshot(spaceId, (prev) => {
    const base: SpaceSnapshot = prev ?? {
      tasks: [],
      members: [],
      updatedAt: Date.now(),
    };
    const tasks = base.tasks.map((t) => (t.id === tempId ? { ...t, id: realId } : t));
    return { ...base, tasks, updatedAt: Date.now() };
  });
}

export function resolveTaskId(taskId: string, map: Record<string, string>): string {
  return map[taskId] ?? taskId;
}

