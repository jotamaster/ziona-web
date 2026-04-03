"use client";

import { useEffect, useState, useTransition } from "react";

import type { BackendSpaceMemberDto, BackendTaskDto, BackendTaskEventDto } from "@/lib/api/backend-client";
import { loadSpaceSnapshot } from "@/lib/offline/snapshots";
import { clientGetTask, isOffline } from "@/lib/offline/task-client";
import { getTaskEventsAction, getTaskForSpaceAction } from "@/lib/tasks/actions";
import { listSpaceMembersAction } from "@/lib/spaces/actions";

import { TaskDetailView } from "./task-detail-view";

type TaskDetailPageClientProps = {
  spaceId: string;
  taskId: string;
};

export function TaskDetailPageClient({ spaceId, taskId }: TaskDetailPageClientProps) {
  const [task, setTask] = useState<BackendTaskDto | null>(null);
  const [events, setEvents] = useState<BackendTaskEventDto[]>([]);
  const [members, setMembers] = useState<BackendSpaceMemberDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      if (!isOffline()) {
        const [tR, eR, mR] = await Promise.all([
          getTaskForSpaceAction(spaceId, taskId),
          getTaskEventsAction(spaceId, taskId),
          listSpaceMembersAction(spaceId),
        ]);
        if (!tR.ok) {
          setError(tR.message);
          setTask(null);
          return;
        }
        setTask(tR.data);
        setEvents(eR.ok ? eR.data : []);
        setMembers(mR.ok ? mR.members : []);
        setError(null);
        return;
      }

      const tR = await clientGetTask(spaceId, taskId);
      if (!tR.ok) {
        setError(tR.message);
        setTask(null);
        return;
      }
      setTask(tR.data);
      setEvents([]);
      const snap = await loadSpaceSnapshot(spaceId);
      setMembers(snap?.members ?? []);
      setError(null);
    });
  }, [spaceId, taskId]);

  if (error && task == null && !pending) {
    return (
      <div className="rounded-[var(--neu-radius-sm)] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-100">
        {error}
      </div>
    );
  }

  if (task == null) {
    return <p className="text-sm text-[var(--neu-text-muted)]">Cargando…</p>;
  }

  return (
    <TaskDetailView spaceId={spaceId} initialTask={task} initialEvents={events} members={members} />
  );
}
