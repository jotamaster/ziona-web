"use client";

import {
  assignTaskUsersAction,
  completeTaskAction,
  createTaskAction,
  deleteTaskAction,
  reopenTaskAction,
  unassignTaskUserAction,
  updateTaskAction,
} from "@/lib/tasks/actions";

import { mergeTaskIntoList, removeTaskFromList } from "./optimistic-task";
import { outboxDelete, outboxGetAll } from "./idb";
import type { OutboxRow } from "./outbox-types";
import {
  getTempIdMap,
  patchSpaceSnapshot,
  remapTaskIdEverywhere,
  resolveTaskId,
} from "./snapshots";

let flushing = false;

export async function flushOutbox(): Promise<void> {
  if (typeof window === "undefined" || !navigator.onLine || flushing) return;
  flushing = true;
  try {
    const rows = await outboxGetAll<OutboxRow & { createdAt: number }>();
    const sorted = [...rows].sort((a, b) => a.createdAt - b.createdAt);
    for (const row of sorted) {
      const map = await getTempIdMap();
      const taskId = resolveTaskId(row.taskId, map);
      const { spaceId } = row;

      switch (row.op) {
        case "create": {
          const r = await createTaskAction(spaceId, row.body);
          if (!r.ok) break;
          await remapTaskIdEverywhere(spaceId, row.taskId, r.data.id);
          await patchSpaceSnapshot(spaceId, (prev) => ({
            tasks: mergeTaskIntoList(prev?.tasks ?? [], r.data),
            members: prev?.members ?? [],
            updatedAt: Date.now(),
          }));
          await outboxDelete(row.id);
          break;
        }
        case "update": {
          const r = await updateTaskAction(spaceId, taskId, row.body);
          if (!r.ok) break;
          await patchSpaceSnapshot(spaceId, (prev) => ({
            tasks: mergeTaskIntoList(prev?.tasks ?? [], r.data),
            members: prev?.members ?? [],
            updatedAt: Date.now(),
          }));
          await outboxDelete(row.id);
          break;
        }
        case "delete": {
          const r = await deleteTaskAction(spaceId, taskId);
          if (!r.ok) break;
          await patchSpaceSnapshot(spaceId, (prev) => ({
            tasks: removeTaskFromList(prev?.tasks ?? [], taskId),
            members: prev?.members ?? [],
            updatedAt: Date.now(),
          }));
          await outboxDelete(row.id);
          break;
        }
        case "complete": {
          const r = await completeTaskAction(spaceId, taskId);
          if (!r.ok) break;
          await patchSpaceSnapshot(spaceId, (prev) => ({
            tasks: mergeTaskIntoList(prev?.tasks ?? [], r.data),
            members: prev?.members ?? [],
            updatedAt: Date.now(),
          }));
          await outboxDelete(row.id);
          break;
        }
        case "reopen": {
          const r = await reopenTaskAction(spaceId, taskId);
          if (!r.ok) break;
          await patchSpaceSnapshot(spaceId, (prev) => ({
            tasks: mergeTaskIntoList(prev?.tasks ?? [], r.data),
            members: prev?.members ?? [],
            updatedAt: Date.now(),
          }));
          await outboxDelete(row.id);
          break;
        }
        case "assign": {
          const r = await assignTaskUsersAction(spaceId, taskId, row.userIds);
          if (!r.ok) break;
          await patchSpaceSnapshot(spaceId, (prev) => ({
            tasks: mergeTaskIntoList(prev?.tasks ?? [], r.data),
            members: prev?.members ?? [],
            updatedAt: Date.now(),
          }));
          await outboxDelete(row.id);
          break;
        }
        case "unassign": {
          const r = await unassignTaskUserAction(spaceId, taskId, row.userId);
          if (!r.ok) break;
          await patchSpaceSnapshot(spaceId, (prev) => ({
            tasks: mergeTaskIntoList(prev?.tasks ?? [], r.data),
            members: prev?.members ?? [],
            updatedAt: Date.now(),
          }));
          await outboxDelete(row.id);
          break;
        }
        default:
          break;
      }
    }
  } finally {
    flushing = false;
  }
}
