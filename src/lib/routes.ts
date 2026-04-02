export const ROUTES = {
  login: "/",
  app: "/app",
  spaces: "/app/spaces",
  invitations: "/app/invitations",
} as const;

export function routeSpaceAdmin(spaceId: string): string {
  return `/app/spaces/${encodeURIComponent(spaceId)}`;
}

export function routeSpaceTask(spaceId: string, taskId: string): string {
  return `/app/spaces/${encodeURIComponent(spaceId)}/tasks/${encodeURIComponent(taskId)}`;
}
