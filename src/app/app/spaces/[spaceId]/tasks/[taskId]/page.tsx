import { notFound } from "next/navigation";

import { TaskDetailView } from "@/components/tasks/task-detail-view";
import { getSpaceMembers } from "@/lib/spaces/get-space-members";
import { getSpaces } from "@/lib/spaces/get-spaces";
import { getTaskEventsForPage, getTaskForPage } from "@/lib/tasks/get-task";

type TaskDetailPageProps = {
  params: Promise<{ spaceId: string; taskId: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { spaceId, taskId } = await params;
  const spaces = await getSpaces();
  const space = spaces.find((s) => s.id === spaceId);
  if (!space) {
    notFound();
  }

  const task = await getTaskForPage(spaceId, taskId);
  if (!task) {
    notFound();
  }

  const [events, members] = await Promise.all([
    getTaskEventsForPage(spaceId, taskId),
    getSpaceMembers(spaceId),
  ]);

  return <TaskDetailView spaceId={spaceId} initialTask={task} initialEvents={events} members={members} />;
}
