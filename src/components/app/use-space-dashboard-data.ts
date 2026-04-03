"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { BackendSpaceMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import {
  getOutboxPendingCount,
  loadDashboardDataForSpace,
} from "@/lib/offline/task-client";

export type SpaceDashboardData = {
  members: BackendSpaceMemberDto[] | null;
  membersError: string | null;
  membersLoading: boolean;
  tasks: BackendTaskDto[] | null;
  tasksError: string | null;
  tasksLoading: boolean;
  refetch: () => void;
  /** True si al menos parte de los datos salió de IndexedDB */
  fromCache: boolean;
  /** Mutaciones de tareas pendientes de sincronizar */
  pendingSyncCount: number;
  /** `navigator.onLine === false` */
  networkOffline: boolean;
};

export function useSpaceDashboardData(selectedSpaceId: string | null): SpaceDashboardData {
  const [members, setMembers] = useState<BackendSpaceMemberDto[] | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<BackendTaskDto[] | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [networkOffline, setNetworkOffline] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const sync = () => setNetworkOffline(typeof navigator !== "undefined" && !navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const load = useCallback(() => {
    if (selectedSpaceId == null) {
      return;
    }

    setMembersError(null);
    setTasksError(null);

    startTransition(async () => {
      const result = await loadDashboardDataForSpace(selectedSpaceId);
      setMembers(result.members);
      setMembersError(result.membersError);
      setTasks(result.tasks);
      setTasksError(result.tasksError);
      setFromCache(result.fromCache);
      setPendingSyncCount(await getOutboxPendingCount());
    });
  }, [selectedSpaceId]);

  useEffect(() => {
    if (selectedSpaceId == null) {
      setMembers(null);
      setMembersError(null);
      setTasks(null);
      setTasksError(null);
      setFromCache(false);
      setPendingSyncCount(0);
      return;
    }
    setMembers(null);
    setTasks(null);
    setMembersError(null);
    setTasksError(null);
    load();
  }, [selectedSpaceId, load]);

  useEffect(() => {
    const onSync = () => {
      if (selectedSpaceId == null) return;
      startTransition(async () => {
        const result = await loadDashboardDataForSpace(selectedSpaceId);
        setMembers(result.members);
        setMembersError(result.membersError);
        setTasks(result.tasks);
        setTasksError(result.tasksError);
        setFromCache(result.fromCache);
        setPendingSyncCount(await getOutboxPendingCount());
      });
    };
    window.addEventListener("ziona-offline-sync", onSync);
    return () => window.removeEventListener("ziona-offline-sync", onSync);
  }, [selectedSpaceId]);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  const membersLoading = pending || (selectedSpaceId != null && members === null && !membersError);
  const tasksLoading = pending || (selectedSpaceId != null && tasks === null && !tasksError);

  return {
    members,
    membersError,
    membersLoading,
    tasks,
    tasksError,
    tasksLoading,
    refetch,
    fromCache,
    pendingSyncCount,
    networkOffline,
  };
}
