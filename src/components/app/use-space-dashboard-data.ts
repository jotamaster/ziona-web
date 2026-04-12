"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { BackendSpaceMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import { listSpaceMembersAction } from "@/lib/spaces/actions";
import { listTasksForSpaceAction } from "@/lib/tasks/actions";

export type SpaceDashboardData = {
  members: BackendSpaceMemberDto[] | null;
  membersError: string | null;
  membersLoading: boolean;
  tasks: BackendTaskDto[] | null;
  tasksError: string | null;
  tasksLoading: boolean;
  refetch: () => void;
};

export function useSpaceDashboardData(selectedSpaceId: string | null): SpaceDashboardData {
  const [members, setMembers] = useState<BackendSpaceMemberDto[] | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<BackendTaskDto[] | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    if (selectedSpaceId == null) {
      return;
    }

    setMembersError(null);
    setMembers(null);
    setTasksError(null);
    setTasks(null);

    startTransition(async () => {
      const [membersResult, tasksResult] = await Promise.all([
        listSpaceMembersAction(selectedSpaceId),
        listTasksForSpaceAction(selectedSpaceId),
      ]);

      if (membersResult.ok) {
        setMembers(membersResult.members);
      } else {
        setMembersError(membersResult.message);
        setMembers(null);
      }

      if (tasksResult.ok) {
        setTasks(tasksResult.tasks);
      } else {
        setTasksError(tasksResult.message);
        setTasks(null);
      }
    });
  }, [selectedSpaceId]);

  useEffect(() => {
    if (selectedSpaceId == null) {
      setMembers(null);
      setMembersError(null);
      setTasks(null);
      setTasksError(null);
      return;
    }
    load();
  }, [selectedSpaceId, load]);

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
  };
}
