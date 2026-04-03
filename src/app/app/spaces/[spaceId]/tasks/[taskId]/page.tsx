import { TaskDetailPageClient } from "@/components/tasks/task-detail-page-client";

type TaskDetailPageProps = {
  params: Promise<{ spaceId: string; taskId: string }>;
};

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { spaceId, taskId } = await params;
  return <TaskDetailPageClient spaceId={spaceId} taskId={taskId} />;
}
