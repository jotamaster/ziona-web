import { notFound } from "next/navigation";

import { TaskDetailView } from "@/components/tasks/task-detail-view";
import { getHomes } from "@/lib/homes/get-homes";
import { getHomeMembers } from "@/lib/homes/get-home-members";
import { getTaskEventsForPage, getTaskForPage } from "@/lib/tasks/get-task";

type TaskDetailPageProps = {
  params: Promise<{ homeId: string; taskId: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { homeId, taskId } = await params;
  const homes = await getHomes();
  const home = homes.find((h) => h.id === homeId);
  if (!home) {
    notFound();
  }

  const task = await getTaskForPage(homeId, taskId);
  if (!task) {
    notFound();
  }

  const [events, members] = await Promise.all([
    getTaskEventsForPage(homeId, taskId),
    getHomeMembers(homeId),
  ]);

  return <TaskDetailView homeId={homeId} initialTask={task} initialEvents={events} members={members} />;
}
