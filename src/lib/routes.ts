export const ROUTES = {
  login: "/",
  app: "/app",
  homes: "/app/homes",
  invitations: "/app/invitations",
} as const;

export function routeHomeAdmin(homeId: string): string {
  return `/app/homes/${encodeURIComponent(homeId)}`;
}
