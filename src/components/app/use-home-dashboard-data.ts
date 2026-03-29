"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import type { BackendHomeMemberDto, BackendTaskDto } from "@/lib/api/backend-client";
import { listHomeMembersAction } from "@/lib/homes/actions";
import { listTasksForHomeAction } from "@/lib/tasks/actions";

export type HomeDashboardData = {
  members: BackendHomeMemberDto[] | null;
  membersError: string | null;
  membersLoading: boolean;
  tasks: BackendTaskDto[] | null;
  tasksError: string | null;
  tasksLoading: boolean;
  refetch: () => void;
};

export function useHomeDashboardData(selectedHomeId: string | null): HomeDashboardData {
  const [members, setMembers] = useState<BackendHomeMemberDto[] | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<BackendTaskDto[] | null>(null);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    if (selectedHomeId == null) {
      return;
    }

    setMembersError(null);
    setMembers(null);
    setTasksError(null);
    setTasks(null);

    startTransition(async () => {
      const [membersResult, tasksResult] = await Promise.all([
        listHomeMembersAction(selectedHomeId),
        listTasksForHomeAction(selectedHomeId),
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
  }, [selectedHomeId]);

  useEffect(() => {
    if (selectedHomeId == null) {
      setMembers(null);
      setMembersError(null);
      setTasks(null);
      setTasksError(null);
      return;
    }
    load();
  }, [selectedHomeId, load]);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  const membersLoading = pending || (selectedHomeId != null && members === null && !membersError);
  const tasksLoading = pending || (selectedHomeId != null && tasks === null && !tasksError);

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
